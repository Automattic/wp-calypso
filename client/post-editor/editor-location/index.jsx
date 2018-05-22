/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import EditorDrawerWell from 'post-editor/editor-drawer-well';
import { reverseGeocode } from '../../lib/geocoding';
import { recordEvent, recordStat } from 'lib/posts/stats';
import PostMetadata from 'lib/post-metadata';
import EditorLocationSearch from './search';
import Notice from 'components/notice';
import RemoveButton from 'components/remove-button';
import { updatePostMetadata, deletePostMetadata } from 'state/posts/actions';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getEditorPostId } from 'state/ui/editor/selectors';
import { getEditedPost } from 'state/posts/selectors';

/**
 * Module variables
 */
const GOOGLE_MAPS_BASE_URL = 'https://maps.google.com/maps/api/staticmap?';

// Convert a float coordinate to formatted string with 7 decimal places.
// Ensures correct equality comparison with values returned from WP.com API
// that formats float metadata values exactly this way.
const toGeoString = coord => String( Number( coord ).toFixed( 7 ) );

// Convert 'public'/'private' strings to the expected 1/0 used by the
// geo_public meta field.  When writing geo-location data, we have to
// set geo_public as well (even if just to the default) because themes
// check that geo_public is present and truthy before display geo data.
const publicValueToMetaValue = value => ( 'public' === value ? 1 : 0 );

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
		isSharedPublicly: PropTypes.oneOf( [ 'private', 'public' ] ),
	};

	state = {
		error: null,
		previouslyPrivatePostBeingModified: false,
	};

	constructor( props ) {
		super( props );

		this.originalProps = props;
	}

	componentWillReceiveProps( nextProps ) {
		if (
			'private' === this.originalProps.isSharedPublicly &&
			( this.originalProps.coordinates && nextProps.coordinates ) &&
			( this.originalProps.coordinates[ 0 ] !== nextProps.coordinates[ 0 ] ||
				this.originalProps.coordinates[ 1 ] !== nextProps.coordinates[ 1 ] )
		) {
			this.setState( { previouslyPrivatePostBeingModified: true } );
		}
	}

	onGeolocateSuccess = position => {
		const latitude = toGeoString( position.coords.latitude ),
			longitude = toGeoString( position.coords.longitude );

		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: latitude,
			geo_longitude: longitude,
			geo_public: publicValueToMetaValue( this.props.isSharedPublicly ),
		} );

		recordStat( 'location_geolocate_success' );

		reverseGeocode( latitude, longitude )
			.then( results => {
				const localityResults = results.filter( result => {
					return -1 !== result.types.indexOf( 'locality' );
				} );

				if ( localityResults.length ) {
					this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
						geo_address: localityResults[ 0 ].formatted_address,
					} );
				}

				recordStat( 'location_reverse_geocode_success' );
			} )
			.catch( () => {
				this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
					geo_address: latitude + ', ' + longitude,
				} );

				recordStat( 'location_reverse_geocode_failed' );
			} )
			.finally( () => {
				this.setState( {
					locating: false,
				} );
			} );
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
		this.props.deletePostMetadata( this.props.siteId, this.props.postId, [
			'geo_latitude',
			'geo_longitude',
			'geo_public',
			'geo_address',
		] );
	};

	onSearchSelect = result => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: toGeoString( result.geometry.location.lat ),
			geo_longitude: toGeoString( result.geometry.location.lng ),
			geo_address: result.formatted_address,
			geo_public: publicValueToMetaValue( this.props.isSharedPublicly ),
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
			} );

		return <img src={ src } className="editor-location__map" />;
	};

	render() {
		let error, publicNotice, buttonText;

		if ( this.state.previouslyPrivatePostBeingModified ) {
			publicNotice = (
				<Notice status="is-warning" onDismissClick={ this.resetError } isCompact>
					{ this.props.translate( 'Location will be displayed publicly.', {
						context: 'Post editor geolocation',
					} ) }
				</Notice>
			);
		}

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
				{ publicNotice }
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
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const postId = getEditorPostId( state );
		const post = getEditedPost( state, siteId, postId );
		const coordinates = PostMetadata.geoCoordinates( post );
		const isSharedPublicly = PostMetadata.geoIsSharedPublicly( post );
		const label = PostMetadata.geoLabel( post );

		return { siteId, postId, coordinates, isSharedPublicly, label };
	},
	{
		updatePostMetadata,
		deletePostMetadata,
	}
)( localize( EditorLocation ) );
