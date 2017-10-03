/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import qs from 'querystring';

/**
 * Internal dependencies
 */
const PostActions = require( 'lib/posts/actions' );
const stats = require( 'lib/posts/stats' );
import Notice from 'components/notice';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import EditorLocationSearch from './search';

/**
 * Module variables
 */
const GOOGLE_MAPS_BASE_URL = 'https://maps.google.com/maps/api/staticmap?';

class EditorLocation extends Component {

	static propTypes = {
		label: PropTypes.string,
		coordinates: function( props, propName ) {
			const prop = props[ propName ];
			if ( prop && ( ! Array.isArray( prop ) || 2 !== prop.length || 2 !== prop.filter( Number ).length ) ) {
				return new Error( 'Expected array pair of coordinates for prop `' + propName + '`.' );
			}
		},
	};

	state = {
		error: null,
	};

	onGeolocateSuccess = ( position ) => {
		this.setState( {
			locating: false,
		} );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.updateMetadata( {
			geo_latitude: position.coords.latitude,
			geo_longitude: position.coords.longitude,
		} );

		stats.recordStat( 'location_geolocate_success' );
	}

	onGeolocateFailure = ( error ) => {
		this.setState( {
			error: error,
			locating: false,
		} );

		stats.recordStat( 'location_geolocate_failed' );
	}

	resetError = () => {
		this.setState( {
			error: null,
		} );
	}

	geolocate = () => {
		this.resetError();
		this.setState( {
			locating: true,
		} );

		navigator.geolocation.getCurrentPosition(
			this.onGeolocateSuccess,
			this.onGeolocateFailure,
			{ enableHighAccuracy: true }
		);

		stats.recordStat( 'location_geolocate' );
		stats.recordEvent( 'Location Geolocated' );
	}

	clear = () => {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.deleteMetadata( [ 'geo_latitude', 'geo_longitude' ] );
	}

	onSearchSelect = ( result ) => {
		PostActions.updateMetadata( {
			geo_latitude: result.geometry.location.lat,
			geo_longitude: result.geometry.location.lng
		} );
	}

	renderCurrentLocation() {
		if ( ! this.props.coordinates ) {
			return;
		}

		const src = GOOGLE_MAPS_BASE_URL + qs.stringify( {
			markers: this.props.coordinates.join( ',' ),
			zoom: 8,
			size: '400x300'
		} );

		return <img src={ src } className="editor-location__map" />;
	}

	render() {
		const { translate } = this.props;
		const { error } = this.state;
		const buttonText = this.state.locating
			? translate( 'Locating…', { context: 'Post editor geolocation' } )
			: translate( 'Get current location', { context: 'Post editor geolocation' } );

		return (
			<div className="editor-location">
				{ error && (
					<Notice status="is-error" onDismissClick={ this.resetError } isCompact>
						{ translate( 'We couldn\'t find your current location.', { context: 'Post editor geolocation' } ) }
					</Notice>
				) }
				<EditorDrawerWell
					icon="location"
					label={ buttonText }
					empty={ ! this.props.coordinates }
					onClick={ this.geolocate }
					onRemove={ this.clear }
					disabled={ this.state.locating }
				>
					{ this.renderCurrentLocation() }
				</EditorDrawerWell>
				<EditorLocationSearch
					onError={ this.onGeolocateFailure }
					onSelect={ this.onSearchSelect }
				/>
			</div>
		);
	}
}

EditorLocation.displayName = 'EditorLocation';

export default localize( EditorLocation );
