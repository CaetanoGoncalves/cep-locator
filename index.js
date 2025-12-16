import axios from "axios";

const CONFIG = {
    'User_Agent': "LocalizadorDeCepLib/1.0",
    'VIACEP_URL': "https://viacep.com.br/ws/",
    'NOMINATIM_URL': "https://nominatim.openstreetmap.org/search?"
}

class ViaCEP 
{
    async findAddress(cep)
    {
        const cleanCEP = cep.replace(/[^0-9]/g, '');
        if(cleanCEP.length !== 8)
        {
            throw new Error("Formato de CEP inválido. CEP precisa ter 8 digitos numéricos");
        }
        try
        {
            const VIACEPURL = CONFIG.VIACEP_URL;
            const params = `${cleanCEP}/json/`;
            const response = await axios.get(`${VIACEPURL}${params}`);
            
            if (response.data.erro)
            {
                throw new Error ("CEP válido, mas não há registros na base de dados ViaCEP");
            }
            return response.data;
        }
        catch(error)
        {
            if(error.response) throw new Error("Erro de conexão com ViaCEP");
            throw error;
        }   
    }
}

class GeoService
{
    async getCoords(logradouro, cidade, uf)
    {
        try
        {
            const params = new URLSearchParams({
                street: logradouro,
                city: cidade,
                state: uf,
                country: 'Brazil',
                format: 'json',
                limit: 1
            })
            
            const url = `${CONFIG.NOMINATIM_URL}${params.toString()}`;
            const config = { headers: { 'User-agent': CONFIG.User_Agent } };
            
            const response = await axios.get(url, config);
            
            if(response.data.length === 0)
            {
                return await this.getCityCenter(cidade, uf);
            }
            
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
                nome_mapa: response.data[0].display_name
            }
        }
        catch(error)
        {
            return null;
        }
    }

    async getCityCenter(cidade, uf)
    {
        try
        {
            const params = new URLSearchParams({
                city: cidade,
                state: uf,
                country: 'Brazil',
                format: 'json',
                limit: 1
            });
            
            const url = `${CONFIG.NOMINATIM_URL}${params.toString()}`;
            const config = { headers: { 'User-agent': CONFIG.User_Agent } };
            
            const response = await axios.get(url, config);
            
            if(response.data.length === 0) return null;
            
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon,
                nome_mapa: "Centro de " + cidade
            }
        }
        catch(error)
        {
            return null;
        }
    }
}

class LocatorService
{
    constructor()
    {
        this.cepService = new ViaCEP();
        this.geoService = new GeoService();
    }

    async find(cep)
    {
        const address = await this.cepService.findAddress(cep);
       
        const coords = await this.geoService.getCoords(
            address.logradouro,
            address.localidade,
            address.uf
        );
        const linkGoogleMaps = coords 
            ? `https://www.google.com/maps?q=${coords.lat},${coords.lon}` 
            : null;
            
        return {
            status:"sucess",
            cep: address.cep,
            rua: address.logradouro,
            cidade: address.localidade,
            estado: address.uf,
            bairro: address.bairro,
            gps: coords ? { lat: coords.lat, lon: coords.lon } : "Indisponível",
            link_mapa: linkGoogleMaps
        }
    }   
}
const locator = new LocatorService();

export const cepLocator = async (cep) => {
    return await locator.find(cep);
};