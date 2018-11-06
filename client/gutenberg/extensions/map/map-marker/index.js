/** @format */

/**
 * External dependencies
 */

import { Component } from '@wordpress/element';

/**
 * Internal dependencies
 */

import './style.scss';

export class MapMarker extends Component {
	componentDidMount() {
		this.renderMarker();
	}
	componentWillUnmount() {
		const { map_service } = this.props;
		if ( this.marker ) {
			this.removeMarkerForMapService( map_service );
		}
	}
	removeMarkerForMapService = map_service => {
		switch ( map_service ) {
			case 'googlemaps':
				this.marker.setMap( null );
				break;
			case 'mapbox':
				this.marker.remove();
				break;
		}
	};
	componentDidUpdate() {
		this.renderMarker();
	}
	handleClick = () => {
		const { onClick } = this.props;
		onClick( this );
	};
	getPoint = () => {
		const { point } = this.props;
		return [ point.coordinates.longitude, point.coordinates.latitude ];
	};
	renderMarker = () => {
		const { map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				return this.renderMarkerGoogle();
			case 'mapbox':
				return this.renderMarkerMapbox();
		}
		return null;
	};
	renderMarkerMapbox = () => {
		const { map, point, service_script, marker_color } = this.props;
		const { handleClick } = this;
		const mapboxPoint = [ point.coordinates.longitude, point.coordinates.latitude ];
		const el = this.marker ? this.marker.getElement() : document.createElement( 'div' );
		if ( this.marker ) {
			this.marker.setLngLat( mapboxPoint );
		} else {
			el.className = 'wp-block-jetpack-map-marker';
			this.marker = new service_script.Marker( el )
				.setLngLat( mapboxPoint )
				.setOffset( [ 0, -19 ] )
				.addTo( map );

			this.marker.getElement().addEventListener( 'click', handleClick );
		}
		el.innerHTML =
			'<?xml version="1.0" encoding="UTF-8"?><svg version="1.1" viewBox="0 0 32 38" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill-rule="evenodd"><path id="d" d="m16 38s16-11.308 16-22-7.1634-16-16-16-16 5.3076-16 16 16 22 16 22z" fill="' +
			marker_color +
			'" mask="url(#c)"/></g></svg>';
	};
	renderMarkerGoogle = () => {
		const { map, point, icon, service_script } = this.props;
		const { handleClick } = this;
		const position = new service_script.maps.LatLng(
			point.coordinates.latitude,
			point.coordinates.longitude
		);

		if ( this.marker ) {
			this.marker.setPosition( position );
			this.marker.setIcon( icon );
		} else {
			this.marker = new service_script.maps.Marker( { position, map, icon } );
			this.marker.addListener( 'click', handleClick );
		}
	};
	render() {
		return null;
	}
}

MapMarker.defaultProps = {
	point: {},
	map: null,
	marker_color: '#000000',
	service_script: null,
	onClick: () => {},
};

export default MapMarker;
