/** @format */
/* global google */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import qs from 'querystring';

export default class extends React.Component {
	static displayName = 'EditorLocationMap';

	static propTypes = {
		coordinates: PropTypes.array,
		onError: PropTypes.func,
		onSelect: PropTypes.func,
	};

	static defaultProps = {
		coordinates: [],
		onError: () => {},
		onSelect: () => {},
	};

	componentDidMount() {
		// Connect the initMap() function within this class to the global window
		// context, so Google Maps can invoke it.
		window.initMap = this.initMap.bind( this );

		const src =
			'https://maps.googleapis.com/maps/api/js?' +
			qs.stringify( {
				key: 'INSERT-API-KEY-HERE',
				callback: 'initMap',
			} );

		// Asynchronously load the Google Maps script, passing in the callback reference.
		// This dumps the `google` var into the global scope, which is not fun, but the only way.
		loadJS( src );
	}

	initMap() {
		this.map = new google.maps.Map( this.mapRef, {
			zoom: 12,
		} );

		// This event listener will call props.onSelect(), which will cause a
		// component re-render, which will cause componentDidUpdate to run,
		// setting the map marker on the clicked location.
		this.map.addListener( 'click', event => {
			this.props.onSelect( {
				geometry: {
					location: {
						lat: event.latLng.lat(),
						lng: event.latLng.lng(),
					},
				},
			} );
		} );
	}

	componentDidUpdate() {
		const { coordinates } = this.props;
		if ( this.map && coordinates.length > 1 ) {
			this.setMarker( {
				lat: coordinates[ 0 ],
				lng: coordinates[ 1 ],
			} );
		}
	}

	// Adds a marker to the map
	setMarker( location ) {
		this.deleteMarker();

		this.marker = new google.maps.Marker( {
			position: location,
			map: this.map,
		} );

		this.map.panTo( this.marker.getPosition() );
	}

	// Deletes all markers in the array by removing references to them.
	deleteMarker() {
		if ( this.marker ) {
			this.marker.setMap( null );
			this.marker = undefined;
		}
	}

	render() {
		const mapRef = el => ( this.mapRef = el );
		return (
			<div ref={ mapRef } style={ { maxWidth: 400, height: 300 } } />
		);
	}
}

function loadJS( src ) {
	const ref = window.document.getElementsByTagName( 'script' )[ 0 ];
	const script = window.document.createElement( 'script' );
	script.src = src;
	script.async = true;
	ref.parentNode.insertBefore( script, ref );
}
