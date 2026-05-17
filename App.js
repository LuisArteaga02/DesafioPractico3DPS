import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Importa tu componente de detalles
import CountryDetails from './components/paisdetalles'; 

const Stack = createStackNavigator();
const url = "https://restcountries.com/v3.1/all";

// ==========================================
// COMPONENTE: PANTALLA DE LISTA DE PAÍSES
// ==========================================
function HomeScreen({ navigation }) {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Guardamos cuál región está activa (por si quieres darle estilo visual luego)
  const [activeRegion, setActiveRegion] = useState("All");

  const noCountries = countries && (countries.status || countries.message);

  // Cargar todos los países (Estado inicial)
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setCountries(data);
    } catch (error) {
      console.error("Error al traer todos los países:", error);
    } finally {
      setLoading(false);
    }
  };

  // Buscador por texto
  const handleSearch = (text) => {
    let name = text.replace(/[^A-Za-z]/g, "");
    if (name) {
      fetch(`https://restcountries.com/v3.1/name/${name}`)
        .then(res => res.json())
        .then(data => setCountries(data.status !== 404 ? data : { status: 404 }))
        .catch(console.log);
    } else {
      // Si el buscador queda vacío, regresa a la región que estaba activa o a todos
      if (activeRegion === "All") {
        fetchData();
      } else {
        handleRegion(activeRegion);
      }
    }
  };

  // Filtro por Región
  const handleRegion = async (region) => {
    setActiveRegion(region);
    if (region === "All") {
      fetchData();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://restcountries.com/v3.1/region/${region}`);
      const data = await res.json();
      if (data.status !== 404) {
        setCountries(data);
      } else {
        setCountries({ status: 404 });
      }
    } catch (error) {
      console.error("Error al filtrar por región:", error);
    } finally {
      setLoading(false);
    }
  };

  // EFECTO INICIAL: Carga los países apenas abre la app
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      {/* 1. Buscador */}
      <TextInput
        style={styles.input}
        placeholder="Search for a country..."
        placeholderTextColor={COLORS.sandDark}
        onChangeText={handleSearch}
      />

      {/* 2. Barra de Regiones Horizontal */}
      <View style={styles.regionContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[ "Asia", "Africa", "Americas", "Europe", "Oceania"].map((region) => (
            <TouchableOpacity 
              key={region} 
              style={[
                styles.regionButton,
                activeRegion === region && styles.activeRegionButton // Cambio de color si está activo
              ]}
              onPress={() => handleRegion(region)}
            >
              <Text style={activeRegion === region ? styles.activeRegionText : styles.regionText}>
                {region === "Americas" ? "America" : region}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. Lista de Países */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ flex: 1 }} />
      ) : (
        <ScrollView style={styles.listContainer}>
          {!noCountries && Array.isArray(countries) ? (
            countries.map((country, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.card}
                onPress={() => navigation.navigate('Details', { countryName: country.name.common })}
              >
                <Text style={styles.countryName}>{country.name.common}</Text>
                <Text style={styles.countrySub}>Capital: {country.capital ? country.capital[0] : "N/A"}</Text>
                <Text style={styles.countrySub}>Region: {country.region}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.errorText}>No Countries Found</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ==========================================
// COMPONENTE RAÍZ DE LA APP
// ==========================================
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Explore Countries' }}
        />
        <Stack.Screen 
          name="Details" 
          component={CountryDetails} 
          options={{ title: 'Country Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const COLORS = {
  bgPrimary:   '#3B153A',   // fondo principal
  bgDeep:      '#2a0f29',   // header
  bgCard:      'rgba(255,255,255,0.06)', // tarjetas
  bgMid:       '#5a2659',   // inputs
 
  sand:        '#F0C987',   // texto principal e iconos
  sandDark:    '#d4a85a',   // texto secundario
  sandSubtle:  'rgba(240,201,135,0.15)', // fondos secundarios
 
  border:      'rgba(240,201,135,0.15)', //bordes
  borderHover: 'rgba(240,201,135,0.3)',
 
  white:       '#ffffff', 
  error:       '#f28b82',
};

const styles = StyleSheet.create({

// Contenedor principal
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    paddingHorizontal: 12,
  },
 
  // Buscador
  input: {
    height: 46,
    backgroundColor: COLORS.bgMid,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 12,
    color: COLORS.sand,
    fontSize: 14,
  },
 
  // Fila de regiones
  regionContainer: {
    height: 40,
    marginBottom: 16,
  },

  regionButton: {
    backgroundColor: COLORS.bgMid,
    borderColor: COLORS.border,
    borderWidth: 1,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 34,
  },

  activeRegionButton: {
    backgroundColor: COLORS.sand,
    borderColor: 'transparent',
  },

  regionText: {
    color: COLORS.sandDark,
    fontWeight: '500',
    fontSize: 13,
  },

  activeRegionText: {
    color: COLORS.bgPrimary,
    fontWeight: 'bold',
    fontSize: 13,
  },
 
  // Lista
  listContainer: {
    flex: 1,
  },
 
  // Tarjeta de país
  card: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  countryName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: COLORS.sand,
    marginBottom: 4,
  },

  countrySub: {
    color: COLORS.sandDark,
    fontSize: 14,
    marginTop: 3,
  }, 
  
  // Mensajes
  errorText: {
    textAlign: 'center',
    marginTop: 30,
    color: COLORS.error,
    fontSize: 15,
  },
});