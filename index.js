require('dotenv').config();

const {
    inquirerMenu,
    pausa,
    leerInput,
    listPlaces
} = require('./helpers/inquirer');
const Searches = require('./models/searches');


console.clear();

const main = async () => {

    const searches = new Searches();

    let opt;

    do {

        // Imprimir el menú
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                // Mostrar mensaje
                const term = await leerInput('Ciudad: ');

                // Buscar los lugares
                const places = await searches.city(term);

                // Seleccionar el lugar
                const selectedId = await listPlaces(places);

                if (selectedId === '0') continue;

                const selectedPlace = places.find(p => p.id === selectedId);

                // Save on DB
                searches.addHistory(selectedPlace.name);

                // Clima
                const selectedCityWeather = await searches.weatherByPlace(selectedPlace.lat, selectedPlace.lng);

                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:', selectedPlace.name.green);
                console.log('Lat:', selectedPlace.lng);
                console.log('Lng:', selectedPlace.lat);
                console.log('Temperatura:', selectedCityWeather.temp);
                console.log('Mínima:', selectedCityWeather.min);
                console.log('Máxima:', selectedCityWeather.max);
                console.log('El clima está:', selectedCityWeather.desc.green);

                break;

            case 2:
                searches.capitalizedHistory.forEach((place, index) => {
                    const number = `${index + 1}`.green;
                    console.log(`${number} ${place}`);
                })
                break;

        }

        await pausa();

    } while (opt !== 0);

}

main();