/**
 * External dependencies
 */
import React from 'react';
import Card from 'components/card';
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
import { GoogleMap, withGoogleMap, Marker } from 'react-google-maps';

const MapComponent = withScriptjs( withGoogleMap( props =>
	<GoogleMap
		ref={ () => console.log('load', arguments ) }
		defaultZoom={13}
		defaultCenter={{
			lat: 25.0112183,
			lng: 121.52067570000001,
		}}
	>
		{
			[{
				position: {
					lat: 25.0112183,
					lng: 121.52067570000001,
				},
				key: `Taiwan`,
				defaultAnimation: 2,
			}].map( marker => <Marker
				{...marker}
			/> )
		}
	</GoogleMap>
) );

const API_KEY = 'AIzaSyDEF7xjF5f6Ph5VrLxNMJ6oNT4ZDyXp59A';

export default props => <Card>
	<div style={{ height: '400px' }}>
		<MapComponent
			googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&key=${API_KEY}`}
			loadingElement={
				<div style={ { height: '100%' } } >
					Loading...
				</div>
			}
			containerElement={
				<div style={ { height: '100%' } } />
			}
			mapElement={
				<div style={ { height: '100%' } } />
			}
		/>
	</div>
</Card>;


