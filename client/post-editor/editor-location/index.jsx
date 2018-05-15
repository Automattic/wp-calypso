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
import FormCheckbox from 'components/forms/form-checkbox';
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

function statusToBoolean( status ) {
	return 'public' === status;
}

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
		isSharedPublicly: PropTypes.string,
	};

	state = {
		error: null,
	};

	onGeolocateSuccess = position => {
		this.setState( {
			locating: false,
		} );

		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: toGeoString( position.coords.latitude ),
			geo_longitude: toGeoString( position.coords.longitude ),
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
		this.props.deletePostMetadata( this.props.siteId, this.props.postId, [
			'geo_latitude',
			'geo_longitude',
		] );
	};

	onSearchSelect = result => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_latitude: toGeoString( result.geometry.location.lat ),
			geo_longitude: toGeoString( result.geometry.location.lng ),
		} );
	};

	onShareChange = event => {
		this.props.updatePostMetadata( this.props.siteId, this.props.postId, {
			geo_public: event.target.checked ? 1 : 0,
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
					disabled={ this.state.locating }
				>
					{ this.renderCurrentLocation() }
					<RemoveButton onRemove={ this.clear } />
				</EditorDrawerWell>
				<EditorLocationSearch
					onError={ this.onGeolocateFailure }
					onSelect={ this.onSearchSelect }
				/>
				<label htmlFor="geo_public">
					<FormCheckbox
						id="geo_public"
						name="geo_public"
						checked={ statusToBoolean( this.props.isSharedPublicly ) }
						onChange={ this.onShareChange }
					/>
					<span>{ this.props.translate( 'Display location publicly' ) }</span>
				</label>
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

		return { siteId, postId, coordinates, isSharedPublicly };
	},
	{
		updatePostMetadata,
		deletePostMetadata,
	}
)( localize( EditorLocation ) );
