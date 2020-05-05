/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { find, includes } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import { reverseGeocode } from '../../lib/geocoding';
import { recordEditorStat, recordEditorEvent } from 'state/posts/stats';
import PostMetadata from 'lib/post-metadata';
import EditorLocationSearch from './search';
import Notice from 'components/notice';
import RemoveButton from 'components/remove-button';
import { updatePostMetadata, deletePostMetadata } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getSitePost, getEditedPost } from 'state/posts/selectors';
import config from 'config';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Module variables
 */
const GOOGLE_MAPS_BASE_URL = 'https://maps.google.com/maps/api/staticmap?';

// Convert a float coordinate to formatted string with 7 decimal places.
// Ensures correct equality comparison with values returned from WP.com API
// that formats float metadata values exactly this way.
const toGeoString = ( coord ) => String( Number( coord ).toFixed( 7 ) );

const coordinatePropType = function ( props, propName ) {
	const prop = props[ propName ];
	if (
		prop &&
		( ! Array.isArray( prop ) || 2 !== prop.length || 2 !== prop.filter( Number ).length )
	) {
		return new Error( 'Expected array pair of coordinates for prop `' + propName + '`.' );
	}
};

class EditorLocation extends React.Component {
	static displayName = 'EditorLocation';

	static propTypes = {
		savedCoordinates: coordinatePropType,
		savedIsSharedPublicly: PropTypes.bool,
		coordinates: coordinatePropType,
		isSharedPublicly: PropTypes.bool,
		label: PropTypes.string,
	};

	state = {
		error: null,
	};

	onGeolocateSuccess = ( position ) => {
		const latitude = toGeoString( position.coords.latitude ),
			longitude = toGeoString( position.coords.longitude );

		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: latitude,
			geo_longitude: longitude,
			geo_public: '1',
		} );

		this.props.recordEditorStat( 'location_geolocate_success' );

		reverseGeocode( latitude, longitude )
			.then( ( results ) => {
				const localityResult = find( results, ( result ) => {
					return includes( result.types, 'locality' );
				} );

				if ( localityResult ) {
					this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
						geo_address: localityResult.formatted_address,
					} );
				}

				this.props.recordEditorStat( 'location_reverse_geocode_success' );
			} )
			.catch( () => {
				this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
					geo_address: latitude + ', ' + longitude,
				} );

				this.props.recordEditorStat( 'location_reverse_geocode_failed' );
			} )
			.then( () => {
				this.setState( {
					locating: false,
				} );
			} );
	};

	onGeolocateFailure = ( error ) => {
		this.setState( {
			error: error,
			locating: false,
		} );
		this.props.recordEditorStat( 'location_geolocate_failed' );
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

		this.props.recordEditorStat( 'location_geolocate' );
		this.props.recordEditorEvent( 'Location Geolocated' );
	};

	clear = () => {
		this.props.deletePostMetadata( this.props.siteId, this.props.postId, [
			'geo_latitude',
			'geo_longitude',
			'geo_public',
			'geo_address',
		] );
	};

	onSearchSelect = ( result ) => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: toGeoString( result.geometry.location.lat() ),
			geo_longitude: toGeoString( result.geometry.location.lng() ),
			geo_address: result.formatted_address,
			geo_public: '1',
		} );
	};

	renderCurrentLocation = () => {
		if ( ! this.props.coordinates ) {
			return;
		}

		const src =
			GOOGLE_MAPS_BASE_URL +
			stringify( {
				markers: this.props.coordinates.join( ',' ),
				zoom: 8,
				size: '400x300',
				key: config( 'google_maps_and_places_api_key' ),
			} );

		return <img src={ src } className="editor-location__map" />;
	};

	privateCoordinatesHaveBeenEdited() {
		// Saved location was already public
		if ( this.props.savedIsSharedPublicly ) {
			return false;
		}

		// Either the saved location or the new location is missing coordinates so we're not revealing
		// private location data.
		if ( ! this.props.savedCoordinates || ! this.props.coordinates ) {
			return false;
		}

		// A previously private location has been edited, which will result in it being set to public
		// when saved.
		return (
			this.props.savedCoordinates[ 0 ] !== this.props.coordinates[ 0 ] ||
			this.props.savedCoordinates[ 1 ] !== this.props.coordinates[ 1 ]
		);
	}

	render() {
		let error, publicWarning, buttonText;

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

		if ( this.privateCoordinatesHaveBeenEdited() ) {
			publicWarning = (
				<div className="editor-location__public-warning">
					{ this.props.translate( 'Note: the location will be displayed publicly.', {
						context: 'Post editor geolocation',
					} ) }
				</div>
			);
		}

		return (
			<div className="editor-location">
				{ error }
				<EditorDrawerWell
					icon="location"
					label={ buttonText }
					empty={ ! this.props.coordinates }
					onClick={ this.geolocate }
					disabled={ this.state.locating }
				>
					{ this.renderCurrentLocation() }
					<RemoveButton onRemove={ this.clear } />
				</EditorDrawerWell>
				<EditorLocationSearch
					onError={ this.onGeolocateFailure }
					onSelect={ this.onSearchSelect }
					value={ this.props.label }
				/>
				{ publicWarning }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );

		const savedPost = getSitePost( state, siteId, postId );
		const savedCoordinates = PostMetadata.geoCoordinates( savedPost );
		const savedIsSharedPublicly = PostMetadata.geoIsSharedPublicly( savedPost );

		const editedPost = getEditedPost( state, siteId, postId );
		const coordinates = PostMetadata.geoCoordinates( editedPost );
		const isSharedPublicly = PostMetadata.geoIsSharedPublicly( editedPost );
		const label = PostMetadata.geoLabel( editedPost );

		return {
			siteId,
			postId,
			savedCoordinates,
			savedIsSharedPublicly,
			coordinates,
			isSharedPublicly,
			label,
		};
	},
	{
		updatePostMetadata,
		deletePostMetadata,
		recordEditorStat,
		recordEditorEvent,
	}
)( localize( EditorLocation ) );
