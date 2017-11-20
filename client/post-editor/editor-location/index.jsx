/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import PostActions from 'lib/posts/actions';
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import { recordEvent, recordStat } from 'lib/posts/stats';
import EditorLocationSearch from './search';
import EditorLocationMap from './map';
import Notice from 'components/notice';

class EditorLocation extends React.Component {
	static displayName = 'EditorLocation';

	static propTypes = {
		label: PropTypes.string,
		coordinates: function( props, propName ) {
			const prop = props[ propName ];
			if (
				prop &&
				( ! Array.isArray( prop ) || 2 !== prop.length || 2 !== prop.filter( Number ).length )
			) {
				return new Error( 'Expected array pair of coordinates for prop `' + propName + '`.' );
			}
		},
	};

	state = {
		error: null,
	};

	onGeolocateSuccess = position => {
		this.setState( {
			locating: false,
		} );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.updateMetadata( {
			geo_latitude: position.coords.latitude,
			geo_longitude: position.coords.longitude,
		} );

		recordStat( 'location_geolocate_success' );
	};

	onGeolocateFailure = error => {
		this.setState( {
			error: error,
			locating: false,
		} );

		recordStat( 'location_geolocate_failed' );
	};

	resetError = () => {
		this.setState( {
			error: null,
		} );
	};

	geolocate = () => {
		this.resetError();
		this.setState( {
			locating: true,
		} );

		navigator.geolocation.getCurrentPosition( this.onGeolocateSuccess, this.onGeolocateFailure, {
			enableHighAccuracy: true,
		} );

		recordStat( 'location_geolocate' );
		recordEvent( 'Location Geolocated' );
	};

	clear = () => {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.deleteMetadata( [ 'geo_latitude', 'geo_longitude' ] );
	};

	onSearchSelect = result => {
		this.resetError();
		PostActions.updateMetadata( {
			geo_latitude: result.geometry.location.lat,
			geo_longitude: result.geometry.location.lng,
		} );
	};

	renderCurrentLocation = () => {
		if ( ! this.props.coordinates ) {
			return;
		}

		return (
			<EditorLocationMap
				coordinates={ this.props.coordinates }
				onError={ this.onGeolocateFailure }
				onSelect={ this.onSearchSelect }
			/>
		);
	};

	render() {
		let error, buttonText;

		if ( this.state.error ) {
			error = (
				<Notice status="is-error" onDismissClick={ this.resetError } isCompact>
					{ this.props.translate( "We couldn't find your current location.", {
						context: 'Post editor geolocation',
					} ) }
				</Notice>
			);
		}

		if ( this.state.locating ) {
			buttonText = this.props.translate( 'Locating…', { context: 'Post editor geolocation' } );
		} else {
			buttonText = this.props.translate( 'Get current location', {
				context: 'Post editor geolocation',
			} );
		}

		return (
			<div className="editor-location">
				{ error }
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

export default localize( EditorLocation );
