import express from "express";
import { cepLocator } from "./index.js";
import { GpsDistance } from "./index.js";
import cors from 'cors';
import axios from "axios";
import 'dotenv/config';

const app = express();
app.use(cors());
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('🚀 API de CEP está Online! Use /consulta/SEU_CEP <br> API de clima está online, use /clima/cidade');
});
app.get('/consulta/:cep', async (req, res) => {
    let cepRequest = req.params.cep;
    cepRequest = cepRequest.replace(/\D/g, '');
    if (cepRequest.length !== 8) {
        return res.status(400).json({
            status:"error",
            erro: "CEP Inválido",
            mensagem: "O CEP deve conter exatamente 8 números."
        });
    }
    try {
        const info = await cepLocator(cepRequest);
        res.status(200).json(info);
    } catch (error) {
        res.status(500).json(
            {
                status:"error",
                message:"Erro no servidor",
                details:error.message
            }
        )
    }
})
app.get('/clima/:cidade', async (req, res) => {
    const cidade = encodeURIComponent(req.params.cidade);
    const WEATHER_KEY = process.env.OPENWEATHER_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${WEATHER_KEY}&units=metric&lang=pt_br`;
    try{
        const infos = await axios.get(url);
        res.status(200).json({
            temperatura:infos.data.main.temp,
            sensacao:infos.data.main.feels_like,
            umidade:infos.data.main.humidity,
            descricao: infos.data.weather[0].description, 
            icone: infos.data.weather[0].icon
        })
    }
    catch(error)
    {
        res.status(500).json(
            {
                status:"error",
                message:"Erro no servidor",
                details:error.message
            }
        )
    }
})
app.get('/escolas/:cep', async (req, res) =>{

    try{let cepRequest = req.params.cep;
    cepRequest = cepRequest.replace(/\D/g, '');
    if (cepRequest.length !== 8) {
        return res.status(400).json({
            status:"error",
            erro: "CEP Inválido",
            mensagem: "O CEP deve conter exatamente 8 números."
        });
    }
    const data = await cepLocator(cepRequest);
    const lon = data.gps.lon;
    const lat = data.gps.lat;
    const url = 'https://overpass-api.de/api/interpreter';
    const query = `
            [out:json];
            (
              node["amenity"="school"](around:5000, ${lat}, ${lon});
              way["amenity"="school"](around:5000, ${lat}, ${lon});
              relation["amenity"="school"](around:5000, ${lat}, ${lon});
            );
            out center;
        `;
    const response = await axios.get(url, {
        params: {data:query}
    });
    const escolas = response.data.elements.map(item => ({
            nome: item.tags.name || "Nome indisponivel",
            tipo: item.tags.amenity,
            lat: item.lat || item.center.lat,
            lon: item.lon || item.center.lon,
            distancia: GpsDistance(lat, lon, item.lat || item.center.lat, item.lon || item.center.lon) + " km"
        }));
    res.status(200).json({
        status:"sucess",
        centro: {lat, lon},
        total_encontrado: escolas.length,
        escolas: escolas
    })}
    catch(err){
        console.error("Erro na busca");
        res.status(500).json({
        status:"error",
        mensage:"erro na busca de escolas",
        details:err.message
        });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});