/** @format */

/**
 * External dependencies
 */

import { __ } from '@wordpress/i18n';
import { Component, createRef, Fragment, Children } from '@wordpress/element';
import { Button, Dashicon, TextareaControl, TextControl } from '@wordpress/components';
import get from 'lodash/get';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */

import MapMarker from './map-marker/';
import InfoWindow from './info-window/';
import { mapboxMapFormatter, googleMapFormatter } from './map-formatter/';

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
			service_script: null,
		};

		// Refs
		this.mapRef = createRef();
	}
	render() {
		const { points, admin, children, marker_color, map_service } = this.props;
		const { map, activeMarker, service_script } = this.state;
		const { onMarkerClick, deleteActiveMarker, updateActiveMarker } = this;
		const currentPoint = get( activeMarker, 'props.point' ) || {};
		const { title, caption } = currentPoint;
		const icon = service_script && this.getGoogleMarkerIcon();
		let addPoint = null;
		Children.map( children, element => {
			if ( element && 'AddPoint' === element.type.name ) {
				addPoint = element;
			}
		} );
		const mapMarkers =
			map &&
			service_script &&
			points.map( ( point, index ) => {
				return (
					<MapMarker
						key={ index }
						point={ point }
						index={ index }
						map={ map }
						service_script={ service_script }
						map_service={ map_service }
						marker_color={ marker_color }
						icon={ icon }
						onClick={ onMarkerClick }
					/>
				);
			} );
		const infoWindow = service_script && (
			<InfoWindow
				activeMarker={ activeMarker }
				map={ map }
				map_service={ map_service }
				service_script={ service_script }
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
								className="wp-block-jetpack-map__marker-caption"
								label={ __( 'Marker Caption', 'jetpack' ) }
								value={ caption }
								rows="2"
								tag="textarea"
								onChange={ value => updateActiveMarker( { caption: value } ) }
							/>
							<Button onClick={ deleteActiveMarker } className="wp-block-jetpack-map__delete-btn">
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
				<div className="wp-block-jetpack-map__gm-container" ref={ this.mapRef }>
					{ mapMarkers }
				</div>
				{ infoWindow }
				{ addPoint }
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
		const { api_key, children, points, map_style, map_details, map_service } = this.props;
		if ( api_key && api_key.length > 0 && api_key !== prevProps.api_key ) {
			this.resetLibraries();
		}
		if ( map_service !== prevProps.map_service ) {
			this.resetLibraries();
		}
		// If the user has just clicked to show the Add Point component, hide info window.
		// AddPoint is the only possible child.
		if ( children !== prevProps.children && children !== false ) {
			this.clearCurrentMarker();
		}
		if ( points !== prevProps.points ) {
			this.setBoundsByMarkers();
		}
		if ( points.length !== prevProps.points.length ) {
			this.clearCurrentMarker();
		}
		if ( map_style !== prevProps.map_style || map_details !== prevProps.map_details ) {
			this.setStyleForMapService( map_service );
		}
	}
	setStyleForMapService = map_service => {
		const { service_script, map } = this.state;
		switch ( map_service ) {
			case 'googlemaps':
				map.setOptions( {
					styles: this.getMapStyle(),
					mapTypeId: service_script.maps.MapTypeId[ this.getMapType() ],
				} );
				break;
			case 'mapbox':
				map.setStyle( this.getMapStyle() );
				break;
		}
	};
	resetLibraries = () => {
		window.mapboxgl = null;
		window.google = null;
		this.loadMapLibraries();
	};
	/* Event handling */
	onMarkerClick = marker => {
		const { onMarkerClick } = this.props;
		this.setState( { activeMarker: marker } );
		onMarkerClick();
	};
	onMapClick = () => {
		this.setState( { activeMarker: null } );
	};
	clearCurrentMarker = () => {
		this.setState( { activeMarker: null } );
	};
	updateActiveMarker = updates => {
		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = points.slice( 0 );

		assign( newPoints[ index ], updates );
		this.props.onSetPoints( newPoints );
	};
	deleteActiveMarker = () => {
		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = points.slice( 0 );

		newPoints.splice( index, 1 );
		this.props.onSetPoints( newPoints );
		this.setState( { activeMarker: null } );
	};
	// Various map functions
	sizeMap = () => {
		const { map } = this.state;
		const { map_service } = this.props;
		const mapEl = this.mapRef.current;
		const blockWidth = mapEl.offsetWidth;
		const maxHeight = window.innerHeight * 0.8;
		const blockHeight = Math.min( blockWidth * ( 3 / 4 ), maxHeight );
		mapEl.style.height = blockHeight + 'px';
		if ( map_service === 'mapbox' ) {
			map.resize();
		}
		this.setBoundsByMarkers();
	};

	setBoundsByMarkers = () => {
		const { map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				return this.setBoundsByMarkersForGoogle();
			case 'mapbox':
				return this.setBoundsByMarkersForMapbox();
		}
	};

	getMapStyle() {
		const { map_style, map_details, map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				return googleMapFormatter( map_style, map_details );
			case 'mapbox':
				return mapboxMapFormatter( map_style, map_details );
		}
	}
	getMapType() {
		const { map_style } = this.props;
		switch ( map_style ) {
			case 'satellite':
				return 'HYBRID';
			case 'terrain':
				return 'TERRAIN';
			case 'black_and_white':
			default:
				return 'ROADMAP';
		}
	}
	// Script loading, browser geolocation
	scriptsLoaded = () => {
		const { map_center, points } = this.props;
		this.setState( { loaded: true } );

		// If the map has any points, skip geolocation and use what we have.
		if ( points.length > 0 ) {
			this.initMap( map_center );
			return;
		}
		this.initMap( map_center );
	};
	loadMapLibraries() {
		const { api_key, map_service } = this.props;
		const src = this.libraryURLForMapService( map_service );
		const alreadyLoaded = this.serviceScriptAlreadyLoaded( map_service );
		if ( alreadyLoaded ) {
			this.setState( { service_script: alreadyLoaded }, this.scriptsLoaded );
			return;
		}
		loadScript( src, error => {
			if ( error ) {
				return;
			}
			if ( 'googlemaps' === map_service ) {
				this.setState( { service_script: window.google }, this.scriptsLoaded );
			}
			if ( 'mapbox' === map_service ) {
				window.mapboxgl.accessToken = api_key;
				this.setState( { service_script: window.mapboxgl }, this.scriptsLoaded );
			}
		} );
	}

	googlePoint2Mapbox( google_point ) {
		const map_center = [
			google_point.longitude ? google_point.longitude : 0,
			google_point.latitude ? google_point.latitude : 0,
		];
		return map_center;
	}

	initMap = map_center => {
		const { map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				this.initGoogle( map_center );
				break;
			case 'mapbox':
				this.initMapbox( map_center );
				break;
		}
	};

	/* Map Service handling */

	initGoogle = map_center => {
		const { service_script } = this.state;
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
			mapTypeId: service_script.maps.MapTypeId[ this.getMapType() ],
			zoom: parseInt( zoom, 10 ),
		};
		const map = new service_script.maps.Map( this.mapRef.current, mapOptions );
		map.addListener(
			'zoom_changed',
			function() {
				this.props.onSetZoom( map.getZoom() );
			}.bind( this )
		);
		map.addListener( 'click', this.onMapClick );
		this.setState( { map }, () => {
			window.addEventListener( 'resize', this.sizeMap );
			service_script.maps.event.trigger( map, 'resize' );
			map.setCenter( new service_script.maps.LatLng( map_center.latitude, map_center.longitude ) );
			this.setBoundsByMarkers();
			onMapLoaded();
		} );
	};

	initMapbox = map_center => {
		const { service_script } = this.state;
		const { zoom, onMapLoaded, onError, admin } = this.props;
		const map = new service_script.Map( {
			container: this.mapRef.current,
			style: 'mapbox://styles/mapbox/streets-v9',
			center: this.googlePoint2Mapbox( map_center ),
			zoom: parseInt( zoom, 10 ),
			pitchWithRotate: false,
			attributionControl: false,
			dragRotate: false,
		} );
		map.on( 'error', e => {
			onError( 'mapbox_error', e.error.message );
		} );
		const zoomControl = new service_script.NavigationControl( {
			showCompass: false,
			showZoom: true,
		} );
		map.on( 'zoomend', () => {
			this.props.onSetZoom( map.getZoom() );
		} );

		/* Listen for clicks on the Map background, which hides the current popup. */
		map.getCanvas().addEventListener( 'click', this.onMapClick );
		this.setState( { map, zoomControl }, () => {
			this.sizeMap();
			if ( ! admin ) {
				map.addControl( new service_script.FullscreenControl() );
			}
			this.mapRef.current.addEventListener( 'alignmentChanged', this.sizeMap );
			map.resize();
			onMapLoaded();
			this.setState( { loaded: true } );
			map.setStyle( this.getMapStyle() );
			window.addEventListener( 'resize', this.sizeMap );
		} );
	};

	serviceScriptAlreadyLoaded = map_service => {
		switch ( map_service ) {
			case 'googlemaps':
				return window.google ? window.google : null;
			case 'mapbox':
				return window.mapboxgl ? window.mapboxgl : null;
		}
		return null;
	};

	setZoomControlForService = ( map_service, visibility ) => {
		const { map, zoomControl } = this.state;
		if ( 'mapbox' === map_service ) {
			if ( visibility ) {
				map.addControl( zoomControl );
			} else {
				map.removeControl( zoomControl );
			}
			return;
		}
		if ( 'googlemaps' === map_service ) {
			map.setOptions( { zoomControl: visibility } );
			return;
		}
	};

	libraryURLForMapService = map_service => {
		const { api_key } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				return [
					'https://maps.googleapis.com/maps/api/js?key=',
					api_key,
					'&libraries=places',
				].join( '' );
			case 'mapbox':
				return 'https://api.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js';
		}
	};

	setBoundsByMarkersForMapbox = () => {
		const { zoom, points, onSetZoom, map_service } = this.props;
		const { map, activeMarker, service_script, fit_to_bounds } = this.state;

		const bounds = new service_script.LngLatBounds();
		if ( ! map || ! points.length || activeMarker ) {
			return;
		}
		points.forEach( point => {
			bounds.extend( [ point.coordinates.longitude, point.coordinates.latitude ] );
		} );
		map.setCenter( bounds.getCenter() );

		// If there are multiple points, zoom is determined by the area they cover,
		// and zoom control is removed.
		if ( points.length > 1 ) {
			map.fitBounds( bounds, {
				padding: {
					top: 40,
					bottom: 40,
					left: 20,
					right: 20,
				},
			} );
			this.setState( { fit_to_bounds: true } );
			this.setZoomControlForService( map_service, false );
			return;
		}
		/* Case where points go from multiple to just one. Set zoom to an arbitrarily high level. */
		if ( fit_to_bounds ) {
			const newZoom = 12;
			map.setZoom( newZoom );
			onSetZoom( newZoom );
		} else {
			// If there are one (or zero) points, user can set zoom
			map.setZoom( parseInt( zoom, 10 ) );
		}
		this.setState( { fit_to_bounds: false } );
		this.setZoomControlForService( map_service, true );
	};

	setBoundsByMarkersForGoogle = () => {
		const { zoom, points, map_service } = this.props;
		const { map, activeMarker, service_script } = this.state;
		const bounds = new service_script.maps.LatLngBounds();
		if ( ! map || ! points.length || activeMarker ) {
			return;
		}
		points.forEach( point => {
			bounds.extend(
				new service_script.maps.LatLng( point.coordinates.latitude, point.coordinates.longitude )
			);
		} );
		map.setCenter( bounds.getCenter() );
		// If there are multiple points, zoom is determined by the area they cover,
		// and zoom control is removed.
		if ( points.length > 1 ) {
			map.fitBounds( bounds );
			this.setState( { fit_to_bounds: true } );
			this.setZoomControlForService( map_service, false );
			return;
		}
		// If there are one (or zero) points, user can set zoom
		map.setZoom( parseInt( zoom, 10 ) );
		this.setState( { fit_to_bounds: false } );
		this.setZoomControlForService( map_service, true );
	};

	getGoogleMarkerIcon() {
		const { marker_color } = this.props;
		const { service_script } = this.state;
		return {
			path:
				'M16,38 C16,38 32,26.692424 32,16 C32,5.307576 24.836556,0 16,0 C7.163444,0 0,5.307576 0,16 C0,26.692424 16,38 16,38 Z',
			fillColor: marker_color,
			fillOpacity: 0.8,
			scale: 1,
			strokeWeight: 0,
			anchor: new service_script.maps.Point( 16, 38 ),
		};
	}
}

Map.defaultProps = {
	points: [],
	map_style: 'default',
	zoom: 13,
	onSetZoom: () => {},
	onMapLoaded: () => {},
	onMarkerClick: () => {},
	onError: () => {},
	marker_color: 'red',
	api_key: null,
	map_center: {},
};

export default Map;
