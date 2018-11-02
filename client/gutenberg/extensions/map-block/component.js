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
import { mapboxMapFormatter } from './mapbox-map-formatter/';

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
			mapboxgl: null,
		};

		// Refs
		this.mapRef = createRef();
	}
	render() {
		const { points, admin, children, marker_color } = this.props;
		const { map, activeMarker, mapboxgl } = this.state;
		const { onMarkerClick, deleteActiveMarker, updateActiveMarker } = this;
		const currentPoint = get( activeMarker, 'props.point' ) || {};
		const { title, caption } = currentPoint;
		let addPoint = null;
		Children.map( children, element => {
			if ( element && 'AddPoint' === element.type.name ) {
				addPoint = element;
			}
		} );
		const mapMarkers =
			map &&
			mapboxgl &&
			points.map( ( point, index ) => {
				return (
					<MapMarker
						key={ index }
						point={ point }
						index={ index }
						map={ map }
						mapboxgl={ mapboxgl }
						marker_color={ marker_color }
						onClick={ onMarkerClick }
					/>
				);
			} );
		const infoWindow = mapboxgl && (
			<InfoWindow
				activeMarker={ activeMarker }
				map={ map }
				mapboxgl={ mapboxgl }
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
		const { api_key, children } = this.props;
		if ( api_key && api_key.length > 0 && api_key !== prevProps.api_key ) {
			window.mapboxgl = null;
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
	mapStyleAndDetailsChanged() {
		const { map } = this.state;
		map.setStyle( this.getMapStyle() );
	}
	map_styleChanged() {
		this.mapStyleAndDetailsChanged();
	}
	map_detailsChanged() {
		this.mapStyleAndDetailsChanged();
	}
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
		const mapEl = this.mapRef.current;
		const blockWidth = mapEl.offsetWidth;
		const maxHeight = window.innerHeight * 0.8;
		const blockHeight = Math.min( blockWidth * ( 3 / 4 ), maxHeight );
		mapEl.style.height = blockHeight + 'px';
		map.resize();
		this.setBoundsByMarkers();
	};
	setBoundsByMarkers = () => {
		const { zoom, points, onSetZoom } = this.props;
		const { map, activeMarker, mapboxgl, zoomControl, fit_to_bounds } = this.state;

		const bounds = new mapboxgl.LngLatBounds();
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
			map.removeControl( zoomControl );
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
		map.addControl( zoomControl );
	};
	getMapStyle() {
		const { map_style, map_details } = this.props;
		return mapboxMapFormatter( map_style, map_details );
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
		const { api_key } = this.props;
		const src = 'https://api.mapbox.com/mapbox-gl-js/v0.50.0/mapbox-gl.js';
		if ( window.mapboxgl ) {
			this.setState( { mapboxgl: window.mapboxgl }, this.scriptsLoaded );
			return;
		}
		loadScript( src, error => {
			if ( error ) {
				return;
			}
			window.mapboxgl.accessToken = api_key;
			this.setState( { mapboxgl: window.mapboxgl }, this.scriptsLoaded );
		} );
	}
	initMap( map_center ) {
		const { mapboxgl } = this.state;
		const { zoom, onMapLoaded, onError, admin } = this.props;
		const map = new mapboxgl.Map( {
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
		const zoomControl = new mapboxgl.NavigationControl( {
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
			map.addControl( zoomControl );
			if ( ! admin ) {
				map.addControl( new mapboxgl.FullscreenControl() );
			}
			this.mapRef.current.addEventListener( 'alignmentChanged', this.sizeMap );
			map.resize();
			onMapLoaded();
			this.setState( { loaded: true } );
			map.setStyle( this.getMapStyle() );
			window.addEventListener( 'resize', this.sizeMap );
		} );
	}
	googlePoint2Mapbox( google_point ) {
		const map_center = [
			google_point.longitude ? google_point.longitude : 0,
			google_point.latitude ? google_point.latitude : 0,
		];
		return map_center;
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
