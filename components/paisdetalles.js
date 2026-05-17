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
                                    <Text style={styles.weatherMeta}>
                                        💧 Humidity: <Text style={styles.weatherMetaValue}>{weather.relative_humidity_2m}%</Text>
                                    </Text>
                                    <Text style={styles.weatherMeta}>
                                        💨 Wind: <Text style={styles.weatherMetaValue}>{weather.wind_speed_10m} km/h</Text>
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

const COLORS = {
  bgPrimary:  '#3B153A',
  bgDeep:     '#2a0f29',
  bgCard:     'rgba(255,255,255,0.06)',
  bgMid:      '#5a2659',
  bgWeather:  'rgba(240,201,135,0.10)',
 
  sand:       '#F0C987',
  sandDark:   '#d4a85a',
  sandSubtle: 'rgba(240,201,135,0.15)',
 
  border:     'rgba(240,201,135,0.15)',
  borderMid:  'rgba(240,201,135,0.25)',
 
  white:      '#ffffff',
  error:      '#f28b82',
  mapBg:      '#1e3a2a', 
};

const styles = StyleSheet.create({
 // Contenedor raíz
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    padding: 16,
  },
 
  // Pantalla de carga
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgPrimary,
  },

  loadingText: {
    marginTop: 12,
    color: COLORS.sandDark,
    fontSize: 14,
  },
 
  // Botón volver
  backButton: {
    backgroundColor: COLORS.sandSubtle,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginTop: 8,
  },

  backButtonText: {
    fontWeight: '600',
    color: COLORS.sand,
    fontSize: 14,
  },
 
  // Centrar cuerpo
  body: {
    alignItems: 'center',
  },
 
  // Bandera
  flag: {
    width: '100%',
    height: 190,
    borderRadius: 10,
    marginBottom: 20,
  },
 
  // Contenido
  contentContainer: {
    width: '100%',
  },
 
  // Nombre del país
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.sand,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.sandDark,
    marginBottom: 16,
  },
  
  // Tarjeta clima
  weatherCard: {
    backgroundColor: COLORS.bgWeather,
    borderWidth: 1,
    borderColor: COLORS.borderMid,
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },

  weatherTitle: {
    fontSize: 14,
    color: COLORS.sand,
    fontWeight: '600',
    marginBottom: 6,
  },

  weatherTemp: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.sand,
    marginBottom: 6,
  },

  weatherMeta: {
    fontSize: 13,
    color: COLORS.sandDark,  
    marginTop: 2,
  },

  weatherMetaValue: {
    fontWeight: 'bold',
    color: COLORS.sand,
  },
 
  // Seccion de info

  infoSection: {
    marginBottom: 20,
  },

  infoText: {
    fontSize: 15,
    marginBottom: 10,
    color: COLORS.sandDark,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },

  bold: {
    fontWeight: 'bold',
    color: COLORS.sand,
  },
 
  // Bordes
  bordersSection: {
    marginTop: 4,
    marginBottom: 24,
  },

  borderBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },

  borderBadge: {
    backgroundColor: COLORS.bgMid,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },

  borderBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.sand,
  },
 
  // Mapa
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  map: {
    width: '100%',
    height: '100%',
  },
 
  // Error genérico
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.error,
    fontSize: 15,
  },
});

export default CountryDetails;