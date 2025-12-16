import express from "express";
import { cepLocator } from "./index.js";
import cors from 'cors';
import axios from "axios";
import 'dotenv/config';

const app = express();
app.use(cors());
const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('🚀 API de CEP está Online! Use /consulta/SEU_CEP');
    res.send('API de clima está online, use /clima/cidade');
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
app.listen(PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
});