/**
 * External dependencies
 */
const React = require( 'react' ),
	qs = require( 'querystring' );

/**
 * Internal dependencies
 */
const PostActions = require( 'lib/posts/actions' ),
	EditorDrawerWell = require( 'post-editor/editor-drawer-well' ),
	Notice = require( 'components/notice' ),
	stats = require( 'lib/posts/stats' ),
	EditorLocationSearch = require( './search' );

/**
 * Module variables
 */
const GOOGLE_MAPS_BASE_URL = 'http://maps.google.com/maps/api/staticmap?';

export default React.createClass( {
	displayName: 'EditorLocation',

	propTypes: {
		label: React.PropTypes.string,
		coordinates: function( props, propName ) {
			var prop = props[ propName ];
			if ( prop && ( ! Array.isArray( prop ) || 2 !== prop.length || 2 !== prop.filter( Number ).length ) ) {
				return new Error( 'Expected array pair of coordinates for prop `' + propName + '`.' );
			}
		}
	},

	getInitialState: function() {
		return {
			error: null
		};
	},

	onGeolocateSuccess: function( position ) {
		this.setState( {
			locating: false
		} );

		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.updateMetadata( {
			geo_latitude: position.coords.latitude,
			geo_longitude: position.coords.longitude
		} );

		stats.recordStat( 'location_geolocate_success' );
	},

	onGeolocateFailure: function( error ) {
		this.setState( {
			error: error,
			locating: false
		} );

		stats.recordStat( 'location_geolocate_failed' );
	},

	resetError: function() {
		this.setState( {
			error: null
		} );
	},

	geolocate: function() {
		this.resetError();
		this.setState( {
			locating: true
		} );

		navigator.geolocation.getCurrentPosition(
			this.onGeolocateSuccess,
			this.onGeolocateFailure,
			{ enableHighAccuracy: true }
		);

		stats.recordStat( 'location_geolocate' );
		stats.recordEvent( 'Location Geolocated' );
	},

	clear: function() {
		// TODO: REDUX - remove flux actions when whole post-editor is reduxified
		PostActions.deleteMetadata( [ 'geo_latitude', 'geo_longitude' ] );
	},

	onSearchSelect: function( result ) {
		PostActions.updateMetadata( {
			geo_latitude: result.geometry.location.lat,
			geo_longitude: result.geometry.location.lng
		} );
	},

	renderCurrentLocation: function() {
		var src;

		if ( ! this.props.coordinates ) {
			return;
		}

		src = GOOGLE_MAPS_BASE_URL + qs.stringify( {
			markers: this.props.coordinates.join( ',' ),
			zoom: 8,
			size: '400x300'
		} );

		return <img src={ src } className="editor-location__map" />;
	},

	render: function() {
		var error, buttonText;

		if ( this.state.error ) {
			error = (
				<Notice status="is-error" onDismissClick={ this.resetError } isCompact>
					{ this.translate( 'We couldn\'t find your current location.', { context: 'Post editor geolocation' } ) }
				</Notice>
			);
		}

		if ( this.state.locating ) {
			buttonText = this.translate( 'Locating…', { context: 'Post editor geolocation' } );
		} else {
			buttonText = this.translate( 'Get current location', { context: 'Post editor geolocation' } );
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
					disabled={ this.state.locating }>
					{ this.renderCurrentLocation() }
				</EditorDrawerWell>
				<EditorLocationSearch
					onError={ this.onGeolocateFailure }
					onSelect={ this.onSearchSelect } />
			</div>
		);
	}
} );
