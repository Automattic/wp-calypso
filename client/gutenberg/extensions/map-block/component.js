/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef, Fragment } from '@wordpress/element';
import { Button, Dashicon, TextareaControl, TextControl } from '@wordpress/components';
import { get, assign } from 'lodash';

/**
 * Internal dependencies
 */

import { settings } from './settings.js';
import MapMarker from './map-marker/';
import InfoWindow from './info-window/';

// @TODO: replace with import from lib/load-script after resolution of https://github.com/Automattic/wp-calypso/issues/27821
import { loadScript } from './load-script';
// import { loadScript } from 'lib/load-script';

export class Map extends Component {
	// Lifecycle
	constructor() {
		super( ...arguments );

		this.state = {
			map: null,
			fit_to_bounds: false,
			loaded: false,
			google: null,
		};

		// Event Handlers as methods
		this.sizeMap = this.sizeMap.bind( this );
		this.onMarkerClick = this.onMarkerClick.bind( this );
		this.deleteActiveMarker = this.deleteActiveMarker.bind( this );
		this.updateActiveMarker = this.updateActiveMarker.bind( this );
		this.onMapClick = this.onMapClick.bind( this );
		this.setBoundsByMarkers = this.setBoundsByMarkers.bind( this );
		this.scriptsLoaded = this.scriptsLoaded.bind( this );

		// Refs
		this.mapRef = createRef();
	}
	render() {
		const { points, admin, children } = this.props;
		const { map, activeMarker, google } = this.state;
		const { onMarkerClick, deleteActiveMarker, updateActiveMarker } = this;
		const currentPoint = get( activeMarker, 'props.point' ) || {};
		const { title, caption } = currentPoint;
		const mapMarkers =
			map &&
			google &&
			points.map( ( point, index ) => {
				return (
					<MapMarker
						key={ index }
						point={ point }
						index={ index }
						map={ map }
						google={ google.maps }
						icon={ this.getMarkerIcon() }
						onClick={ onMarkerClick }
					/>
				);
			} );
		const infoWindow = google && (
			<InfoWindow
				activeMarker={ activeMarker }
				map={ map }
				google={ google }
				unsetActiveMarker={ () => this.setState( { activeMarker: null } ) }
			>
				{ activeMarker &&
					admin && (
						<Fragment>
							<TextControl
								label={ __( 'Marker Title', 'jetpack' ) }
								value={ title }
								onChange={ value => updateActiveMarker( { title: value } ) }
							/>
							<TextareaControl
								className="wp-block-jetpack-maps__marker-caption"
								label={ __( 'Marker Caption', 'jetpack' ) }
								value={ caption }
								rows="3"
								tag="textarea"
								onChange={ value => updateActiveMarker( { caption: value } ) }
							/>
							<Button onClick={ deleteActiveMarker } className="wp-block-jetpack-maps__delete-btn">
								<Dashicon icon="trash" size="15" /> { __( 'Delete Marker', 'jetpack' ) }
							</Button>
						</Fragment>
					) }

				{ activeMarker &&
					! admin && (
						<Fragment>
							<h3>{ title }</h3>
							<p>{ caption }</p>
						</Fragment>
					) }
			</InfoWindow>
		);
		return (
			<Fragment>
				<div className="wp-block-jetpack-maps__gm-container" ref={ this.mapRef }>
					{ mapMarkers }
				</div>
				{ infoWindow }
				{ children }
			</Fragment>
		);
	}
	componentDidMount() {
		const { api_key } = this.props;
		if ( api_key ) {
			this.loadMapLibraries();
		}
	}
	componentDidUpdate( prevProps ) {
		const { api_key, children } = this.props;
		if ( api_key && api_key.length > 0 && api_key !== prevProps.api_key ) {
			window.google = null;
			this.loadMapLibraries();
		}
		// If the user has just clicked to show the Add Point component, hide info window.
		// AddPoint is the only possible child.
		if ( children !== prevProps.children && children !== false ) {
			this.clearCurrentMarker();
		}
		// This implementation of componentDidUpdate is a reusable way to approximate Polymer observers
		for ( const propName in this.props ) {
			const functionName = propName + 'Changed';
			if (
				this.props[ propName ] !== prevProps[ propName ] &&
				typeof this[ functionName ] === 'function'
			) {
				this[ functionName ]( this.props[ propName ] );
			}
		}
	}
	// Observers
	pointsChanged() {
		this.setBoundsByMarkers();
	}
	map_styleChanged() {
		const { map, google } = this.state;

		map.setOptions( {
			styles: this.getMapStyle(),
			mapTypeId: google.maps.MapTypeId[ this.getMapType() ],
		} );
	}
	// Event handling
	onMarkerClick( marker ) {
		const { onMarkerClick } = this.props;
		this.setState( { activeMarker: marker } );
		onMarkerClick();
	}
	onMapClick() {
		this.setState( { activeMarker: null } );
	}
	clearCurrentMarker() {
		this.setState( { activeMarker: null } );
	}
	updateActiveMarker( updates ) {
		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = points.slice( 0 );

		assign( newPoints[ index ], updates );
		this.props.onSetPoints( newPoints );
	}
	deleteActiveMarker() {
		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = points.slice( 0 );

		newPoints.splice( index, 1 );
		this.props.onSetPoints( newPoints );
		this.setState( { activeMarker: null } );
	}
	// Various map functions
	sizeMap() {
		const mapEl = this.mapRef.current;
		const blockWidth = mapEl.offsetWidth;
		const maxHeight = window.innerHeight * 0.8;
		const blockHeight = Math.min( blockWidth * ( 3 / 4 ), maxHeight );
		mapEl.style.height = blockHeight + 'px';
	}
	// Calculate the appropriate zoom and center point of the map based on defined markers
	setBoundsByMarkers() {
		const { zoom, points } = this.props;
		const { map, activeMarker, google } = this.state;
		const bounds = new google.maps.LatLngBounds();
		if ( ! map || ! points.length || activeMarker ) {
			return;
		}
		points.forEach( point => {
			bounds.extend(
				new google.maps.LatLng( point.coordinates.latitude, point.coordinates.longitude )
			);
		} );
		map.setCenter( bounds.getCenter() );

		// If there are multiple points, zoom is determined by the area they cover,
		// and zoom control is removed.
		if ( points.length > 1 ) {
			map.fitBounds( bounds );
			this.setState( { fit_to_bounds: true } );
			map.setOptions( { zoomControl: false } );
			return;
		}

		// If there are one (or zero) points, user can set zoom
		map.setZoom( parseInt( zoom, 10 ) );
		this.setState( { fit_to_bounds: false } );
		map.setOptions( { zoomControl: true } );
	}
	getMapStyle() {
		return settings.styles[ this.props.map_style ].styles;
	}
	getMapType() {
		return settings.styles[ this.props.map_style ].map_type;
	}
	getMarkerIcon() {
		const { marker_color } = this.props;
		const { google } = this.state;
		return {
			path:
				'M16,38 C16,38 32,26.692424 32,16 C32,5.307576 24.836556,0 16,0 C7.163444,0 0,5.307576 0,16 C0,26.692424 16,38 16,38 Z',
			fillColor: marker_color,
			fillOpacity: 0.8,
			scale: 1,
			strokeWeight: 0,
			anchor: new google.maps.Point( 16, 38 ),
		};
	}
	// Script loading, browser geolocation
	scriptsLoaded() {
		const { map_center, points } = this.props;
		this.setState( { loaded: true } );

		// If the map has any points, skip geolocation and use what we have.
		if ( points.length > 0 ) {
			this.initMap( map_center );
			return;
		}
		this.initMap( map_center );
	}
	loadMapLibraries() {
		const { api_key } = this.props;
		const src = [
			'https://maps.googleapis.com/maps/api/js?key=',
			api_key,
			'&libraries=places',
		].join( '' );
		if ( window.google ) {
			this.setState( { google: window.google }, this.scriptsLoaded );
			return;
		}
		loadScript( src, error => {
			if ( error ) {
				return;
			}
			this.setState( { google: window.google }, this.scriptsLoaded );
		} );
	}
	// Create the map object.
	initMap( map_center ) {
		const { google } = this.state;
		const { zoom, onMapLoaded } = this.props;
		const mapOptions = {
			streetViewControl: false,
			mapTypeControl: false,
			panControl: false,
			scrollwheel: false,
			zoomControlOptions: {
				style: 'SMALL',
			},
			styles: this.getMapStyle(),
			mapTypeId: google.maps.MapTypeId[ this.getMapType() ],
			zoom: parseInt( zoom, 10 ),
		};
		const map = new google.maps.Map( this.mapRef.current, mapOptions );
		map.addListener(
			'zoom_changed',
			function() {
				this.props.onSetZoom( map.getZoom() );
			}.bind( this )
		);
		map.addListener( 'click', this.onMapClick );
		this.setState( { map }, () => {
			this.sizeMap();
			this.mapRef.current.addEventListener( 'alignmentChanged', this.sizeMap );
			window.addEventListener( 'resize', this.sizeMap );
			google.maps.event.trigger( map, 'resize' );
			map.setCenter( new google.maps.LatLng( map_center.latitude, map_center.longitude ) );
			this.setBoundsByMarkers();
			onMapLoaded();
			this.setState( { loaded: true } );
		} );
	}
}

Map.defaultProps = {
	points: [],
	map_style: 'default',
	zoom: 13,
	onSetZoom: () => {},
	onMapLoaded: () => {},
	onMarkerClick: () => {},
	marker_color: 'red',
	api_key: null,
	// Default center point is San Francisco
	map_center: {
		latitude: 37.7749295,
		longitude: -122.41941550000001,
	},
};

export default Map;
