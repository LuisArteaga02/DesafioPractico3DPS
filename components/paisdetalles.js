import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from "react-native";
import MapView, { Marker } from "react-native-maps";
const CountryDetails = ({ route, navigation }) => {
    const { countryName } = route?.params || { countryName: "Canada" };

    const [loading, setLoading] = useState(false);
    const [weather, setWeather] = useState(null); // Estado para guardar la temperatura
    const [country, setCountry] = useState({
        name: "",
        official: "",
        flagImg: "",
        population: 0,
        region: "",
        subregion: "",
        capital: "",
        currencies: {},
        languages: {},
        borders: [],
        latitud: null,
        longitud: null,
    });

    const countryUrl = "https://restcountries.com/v3.1/name/";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Petición a la API de Países
                const response = await fetch(`${countryUrl}${countryName}`);
                const res = await response.json();

                if (res && res[0]) {
                    const data = res[0];
                    const lat = data.latlng ? data.latlng[0] : null;
                    const lon = data.latlng ? data.latlng[1] : null;

                    setCountry({
                        name: data.name?.common || "",
                        official: data.name?.official || "",
                        flagImg: data.flags?.png || "",
                        population: data.population || 0,
                        region: data.region || "",
                        subregion: data.subregion || "",
                        capital: data.capital ? data.capital[0] : "N/A",
                        currencies: data.currencies || {},
                        languages: data.languages || {},
                        borders: data.borders || [],
                        latitud: lat != null ? lat : "N/A",
                        longitud: lon != null ? lon : "N/A",
                    });

                    // 2. Petición a Open-Meteo si existen las coordenadas
                    if (lat !== null && lon !== null) {
                        // Usamos current_weather=true para obtener el clima actual directo y más simple
                       
                       const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;
                        

                       const weatherResponse = await fetch(weatherApiUrl);
                    const weatherData = await weatherResponse.json();
                        
                        if (weatherData && weatherData.current) {
                            setWeather({
                            temperature_2m: weatherData.current.temperature_2m,
                            relative_humidity_2m: weatherData.current.relative_humidity_2m,
                            wind_speed_10m: weatherData.current.wind_speed_10m
                            });
                           
                        }
                    }
                }
            } catch (error) {
                console.error("Error critico", error);
            } finally {
                setLoading(false);
            }
        };

        if (countryName) {
            fetchData();
        }
    }, [countryName]);

    const languages = Object.values(country.languages);
    const borders = country.borders;
    const currencies = Object.values(country.currencies);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading . . .</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Go Back</Text>
            </TouchableOpacity>

            <View style={styles.body}>
                {country.flagImg ? (
                    <Image
                        source={{ uri: country.flagImg }}
                        style={styles.flag}
                        resizeMode="contain"
                    />
                ) : null}

                <View style={styles.contentContainer}>
                    <Text style={styles.title}>{country.name}</Text>

                    {/* SECCIÓN DEL CLIMA EN TIEMPO REAL */}
                    <View style={styles.weatherCard}>
                        <Text style={styles.weatherTitle}>☀️ Real-time Weather</Text>

                        {/* 1. Validamos que 'weather' no sea null y que tenga datos adentro */}
                        {weather && weather.temperature_2m !== undefined ? (
                            <View>
                                {/* Temperatura Principal */}
                                <Text style={styles.weatherTemp}>{weather.temperature_2m}°C</Text>

                                {/* Detalles secundarios agrupados de forma segura */}
                                <View style={styles.weatherDetailsContainer}>
                                    <Text style={styles.weatherSubInfo}>
                                        💧 Humidity: <Text style={styles.bold}>{weather.relative_humidity_2m}%</Text>
                                    </Text>
                                    <Text style={styles.weatherSubInfo}>
                                        💨 Wind: <Text style={styles.bold}>{weather.wind_speed_10m} km/h</Text>
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            /* 2. Mientras 'weather' sea null, se muestra este texto de carga */
                            <Text style={styles.infoText}>Loading weather data...</Text>
                        )}
                    </View>
                    <View style={styles.infoSection}>
                        <Text style={styles.infoText}>Official Name: <Text style={styles.bold}>{country.official}</Text></Text>
                        <Text style={styles.infoText}>Population: <Text style={styles.bold}>{country.population.toLocaleString()}</Text></Text>
                        <Text style={styles.infoText}>Region: <Text style={styles.bold}>{country.region}</Text></Text>
                        <Text style={styles.infoText}>Sub Region: <Text style={styles.bold}>{country.subregion}</Text></Text>
                        <Text style={styles.infoText}>Capital: <Text style={styles.bold}>{country.capital}</Text></Text>
                        <Text style={styles.infoText}>Latitud: <Text style={styles.bold}>{country.latitud}</Text></Text>
                        <Text style={styles.infoText}>Longitud: <Text style={styles.bold}>{country.longitud}</Text></Text>
                    </View>

                    <View style={styles.infoSection}>
                        <Text style={styles.infoText}>
                            Currencies:{" "}
                            <Text style={styles.bold}>
                                {currencies.length > 0
                                    ? currencies.map((c) => c.name).join(", ")
                                    : "N/A"}
                            </Text>
                        </Text>

                        <Text style={styles.infoText}>
                            Languages:{" "}
                            <Text style={styles.bold}>
                                {languages.length > 0
                                    ? languages.join(", ")
                                    : "N/A"}
                            </Text>
                        </Text>
                    </View>

                    <View style={styles.bordersSection}>
                        <Text style={styles.infoText}>Borders:</Text>
                        <View style={styles.borderBadgesContainer}>
                            {borders && borders.length > 0 ? (
                                borders.map((border, index) => (
                                    <View key={index} style={styles.borderBadge}>
                                        <Text style={styles.borderBadgeText}>{border}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.bold}> None</Text>
                            )}
                        </View>
                    </View>
                    {country.latitud !== "N/A" && country.longitud !== "N/A" ? (
                        <View style={styles.mapContainer}>
                            <MapView
                                style={styles.map}
                                region={{
                                    latitude: country.latitud,
                                    longitude: country.longitud,
                                    latitudeDelta: 12.0,
                                    longitudeDelta: 12.0,
                                }}
                            >
                                {/* Coloca un pin en el centro del país */}
                                <Marker
                                    coordinate={{ latitude: country.latitud, longitude: country.longitud }}
                                    title={country.name}
                                />
                            </MapView>
                        </View>
                    ) : null}

                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    backButton: {
        backgroundColor: "#eee",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 5,
        alignSelf: "flex-start",
        marginBottom: 20,
        marginTop: 20,
    },
    backButtonText: {
        fontWeight: "600",
    },
    body: {
        alignItems: "center",
    },
    flag: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 20,
    },
    contentContainer: {
        width: "100%",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    weatherCard: {
        backgroundColor: "#e3f2fd",
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#bbdefb",
    },
    weatherTitle: {
        fontSize: 14,
        color: "#1565c0",
        fontWeight: "bold",
        marginBottom: 5,
    },
    weatherTemp: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#0d47a1",
    },
    infoSection: {
        marginBottom: 20,
    },
    infoText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#333",
    },
    bold: {
        fontWeight: "bold",
        color: "#000",
    },
    bordersSection: {
        marginTop: 10,
        marginBottom: 40,
    },
    borderBadgesContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 5,
    },
    borderBadge: {
        backgroundColor: "#f0f0f0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    borderBadgeText: {
        fontSize: 14,
        fontWeight: "600",
    },
    mapContainer: {
        width: '100%',
        height: 250,
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },
    map: {
        width: '100%',
        height: '100%',
    },

});

export default CountryDetails;