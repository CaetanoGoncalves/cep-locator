# Localizador de CEP 📍
Biblioteca simples feita para buscar dados de endereço e coordenadas GPS por meio do CEP
## Como Utilizar

```bash
npm install Github:CaetanoGoncalves/cep-locator
```
## Exemplo de Código (API)
```javascript
import { cepLocator } from 'cep-locator';

async function localizar() {
    try 
    {
        const resultado = await cepLocator('01310-940');
        console.log(resultado);
    } 
    catch (erro) 
    {
        console.error("CEP não encontrado:", erro);
    }
}
localizar();
```
## Como rodar com Express

Para colocar o servidor no ar, rode
```bash
npm start
```

## ⚖️ Aviso Legal e Limites de Uso

Esta biblioteca utiliza serviços públicos e gratuitos:
1. **ViaCEP:** Consulte os [termos de uso](https://viacep.com.br/) para evitar bloqueios por excesso de requisições.
2. **OpenStreetMap (Nominatim):** Dados © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright). O uso da API de geolocalização está sujeito à [Política de Uso do Nominatim](https://operations.osmfoundation.org/policies/nominatim/). Não utilize para processamento em massa (bulk).