import { 
  StyleSheet, 
  View,
  Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import locationsData from './data/locations.json';



export default function App() {

  const [region, setRegion] = useState(null);

  const [ currentLocation, setCurrentLocation ] = useState(null);
  const [ locations, setLocations] = useState(locationsData);

  function calculeDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 
    return distance.toFixed(2);
  }
  function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  const icons = {
    church: require('./assets/church.png'),
    mountain: require('./assets/mountain.png'),
    shopping: require('./assets/shop.png'),
    attraction: require('./assets/attraction.png'),
    monument: require('./assets/monument.png'),
    business: require('./assets/business.png'),
  };  

  useEffect(()=> {
    (async () => {
      const {status} = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const userLocation = await Location.getCurrentPositionAsync({});
        const userRegion = {
          latitude: userLocation.coords.latitude,
          longitude: userLocation.coords.longitude,
          latitudeDelta: 25,
          longitudeDelta: 25,
        };
        setRegion(userRegion);
        setCurrentLocation(userLocation.coords);
        const newLocations = locations.map(marked => {
          let distance = `${calculeDistance(userLocation.coords.latitude, userLocation.coords.longitude, marked.coordinates.latitude, marked.coordinates.longitude)}`;
          return  {...marked, distance };
        })
        setLocations(newLocations);
      }
    })()
  },[]);
 
  const markAllLocation = locations.map((location, i) => {
    return (
      <Marker 
        key={i} 
        coordinate={location.coordinates} 
        title={location.name} 
        description={`${location.distance} km`}
        image={icons[location.type]}
        anchor={{ x: 0.5, y: 0.5 }}
        />
    )});
  
  //{ currentLocation && <Marker coordinate={currentLocation} title="MyLocation"/>}

  return (
    <View style={styles.container}>
      <MapView style={{flex:1}} initialRegion={region}>
        {markAllLocation}
        { currentLocation && <Marker coordinate={currentLocation} title="MyLocation"/>}
      </MapView>
    </View>
  );
  }

const styles = StyleSheet.create({
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  container: {
    flex: 1,
  },
});
