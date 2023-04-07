const fs = require('fs');

const axios = require('axios');

class Searches {

    history = [];
    dataBasePath = './db/database.json';

    constructor() {
        this.readDataBase();
    }

    get capitalizedHistory() {
        return this.history.map((place, index) => {

            let words = place.split(' ');

            words = words.map(word => word[0].toUpperCase() + word.substring(1));

            return words.join(' ');

        })

        //Esto Es La Prueba De Un Texto
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            'appid': process.env.OPENWEATHER_KEY,
            'units': 'metric',
            'lang': 'es'
        }
    }

    async city(place = '') {

        try {

            // Petición http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            return resp.data.features.map(place => ({
                id: place.id,
                name: place.place_name,
                lng: place.center[0],
                lat: place.center[1]
            }));

        } catch (error) {

            return [];

        }

    }

    async weatherByPlace(lat, lon) {

        try {

            // Petición http
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {
                    lat,
                    lon,
                    ...this.paramsOpenWeather
                }
            });

            const resp = await instance.get();

            return {
                desc: resp.data.weather[0].description,
                min: resp.data.main.temp_min,
                max: resp.data.main.temp_max,
                temp: resp.data.main.temp
            };

        } catch (error) {
            console.log(error);
        }

    }

    addHistory(place = '') {
        if (this.history.includes(place.toLocaleLowerCase())) return;

        this.history = this.history.splice(0, 5);

        this.history.unshift(place.toLocaleLowerCase());

        // Save on db
        this.saveDataBase();

    }

    saveDataBase() {

        const payload = {
            history: this.history
        }

        fs.writeFileSync(this.dataBasePath, JSON.stringify(payload));

    }

    readDataBase() {

        if (!fs.existsSync(this.dataBasePath)) return;

        const info = fs.readFileSync(this.dataBasePath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        this.history = data.history;

    }


}

module.exports = Searches;