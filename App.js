import React from 'react';
import MapView from 'react-native-maps';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
// import  from 'expo';
import * as Permissions from 'expo-permissions';
import polyline from '@mapbox/polyline';
const locations = require('./response.json')

export default class App extends React.Component {

  state = {
    latitude: null,
    longitude: null,
    //locations: locations
  }

  async componentDidMount() {
    const { status } = await Permissions.getAsync(Permissions.LOCATION)

    if (status != 'granted') {
      const response = await Permissions.askAsync(Permissions.LOCATION)
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => this.setState({ latitude, longitude }, () => console.log('state:', this.state)),
      (error) => console.log('error:' + error)
    )

    const { locations: [sampleLocation] } = this.state

    this.setState({
      desLatitude: sampleLocation.results.geometry.location.lat,
      desLongitude: sampleLocation.results.geometry.location.lng
    }, () => console.log(this.state))
  }


  mergeCoords = () => {
    const {
      latitude,
      longitude,
      desLatitude,
      desLongitude
    } = this.state

    const hasStartAndEnd = latitude !== null && desLatitude !== null

    if (hasStartAndEnd) {
      const concatStart = `${latitude},${longitude}`
      const concatEnd = `${desLatitude},${desLongitude}`
      this.getDirections(concatStart, concatEnd)
    }
  }

  async getDirections(startLoc, desLoc) {
    try {
      const resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${desLoc}&key=AIzaSyDBKFDTiFqZDldzMP_NGcjIVGi80ADmNBI`)
      const respJson = await resp.json();
      const response = respJson.routes[0]
      const distanceTime = response.legs[0]
      const distance = distanceTime.distance.text
      const time = distanceTime.duration.text
      const points = Polyline.decode(respJson.routes[0].overview_polyline.points);
      const coords = points.map(point => {
        return {
          latitude: point[0],
          longitude: point[1]
        }
      })
      this.setState({ coords, distance, time })
    } catch (error) {
      console.log('Error: ', error)
    }
  }

  render() {

    const { latitude, longitude } = this.state
    return (
      <View style={styles.container}>
        <MapView style={styles.mapStyle}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapStyle: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});