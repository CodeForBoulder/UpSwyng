import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';

import withResource from './withResource';
import { TResource } from '../types';

type Props = { data: TResource };

const boulderCoordinates = {
  lat: 40.0156852,
  lng: -105.2792069
};

class Map extends Component<any, any> {
  constructor(props: Props) {
    super(props);
  }

  createMarkers = (resources: any, map: any, maps: any) => {
    resources.forEach((resource: any) => {
      let marker = new maps.Marker({
        map: map,
        title: resource.name,
        position: {
          lat: resource.lat,
          lng: resource.lng
        }
      });

      let infoWindow = new maps.InfoWindow({
        content:
          '<div><b>' +
          resource.name +
          '</b><br>' +
          resource.category +
          '<br>' +
          resource.address +
          '<br><br>' +
          '<b>For</b>: ' +
          resource.audience +
          '<br>' +
          '<b>Offers</b>: ' +
          resource.services.join(', ') +
          '</div>'
          // will need to include if its open/hours (unsure of how resource.hours will be formatted)
      });

      marker.addListener('mouseover', function() {
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', function() {
        infoWindow.close();
      });
    });
  };

  initMap = (map: any, maps: any) => {
    this.createMarkers(this.props.resources, map, maps);
  };

  render() {
    const firstResource = this.props.resources[0];
    let center = {
      lat: firstResource.lat,
      lng: firstResource.lng
    };

    return (
      // Map must have height/width defined - but manipulate as necessary
      <div style={{ height: '60vh', width: '100%' }}>
        <h1>Map</h1>
        <button>Show Directions to {firstResource.name}</button>
        <GoogleMapReact
          bootstrapURLKeys={{ key: '<API_KEY>' }}
          defaultCenter={boulderCoordinates}
          defaultZoom={13}
          center={center}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.initMap(map, maps)}
        />
      </div>
    );
  }
}

export default Map;
