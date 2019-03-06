/**
 * External dependencies
 */
import { __ } from '../../utils/i18n';
import { assign, debounce, get } from 'lodash';
import { Button, Dashicon, TextareaControl, TextControl } from '@wordpress/components';
import { Children, Component, createRef, Fragment } from '@wordpress/element';

/**
 * Internal dependencies
 */
import MapMarker from './map-marker/';
import InfoWindow from './info-window/';
import { mapboxMapFormatter } from './mapbox-map-formatter/';

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

		// Debouncers
		this.debouncedSizeMap = debounce( this.sizeMap, 250 );
	}
	render() {
		const { points, admin, children, markerColor } = this.props;
		const { map, activeMarker, mapboxgl } = this.state;
		const { onMarkerClick, deleteActiveMarker, updateActiveMarker } = this;
		const currentPoint = get( activeMarker, 'props.point' ) || {};
		const { title, caption } = currentPoint;
		const addPoint = Children.map( children, child => {
			const tagName = get( child, 'props.tagName' );
			if ( 'AddPoint' === tagName ) {
				return child;
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
						markerColor={ markerColor }
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
				{ activeMarker && admin && (
					<Fragment>
						<TextControl
							label={ __( 'Marker Title' ) }
							value={ title }
							onChange={ value => updateActiveMarker( { title: value } ) }
						/>
						<TextareaControl
							className="wp-block-jetpack-map__marker-caption"
							label={ __( 'Marker Caption' ) }
							value={ caption }
							rows="2"
							tag="textarea"
							onChange={ value => updateActiveMarker( { caption: value } ) }
						/>
						<Button onClick={ deleteActiveMarker } className="wp-block-jetpack-map__delete-btn">
							<Dashicon icon="trash" size="15" /> { __( 'Delete Marker' ) }
						</Button>
					</Fragment>
				) }

				{ activeMarker && ! admin && (
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
		const { apiKey } = this.props;
		if ( apiKey ) {
			this.loadMapLibraries();
		}
	}
	componentWillUnmount() {
		this.debouncedSizeMap.cancel();
	}
	componentDidUpdate( prevProps ) {
		const { apiKey, children, points, mapStyle, mapDetails } = this.props;
		const { map } = this.state;
		if ( apiKey && apiKey.length > 0 && apiKey !== prevProps.apiKey ) {
			this.loadMapLibraries();
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
		if ( mapStyle !== prevProps.mapStyle || mapDetails !== prevProps.mapDetails ) {
			map.setStyle( this.getMapStyle() );
		}
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
		const { map, activeMarker, mapboxgl, zoomControl, boundsSetProgrammatically } = this.state;
		if ( ! map ) {
			return;
		}
		// If there are no points at all, there is no data to set bounds to. Abort the function.
		if ( ! points.length ) {
			return;
		}
		// If there is an open info window, resizing will probably move the info window which complicates interaction.
		if ( activeMarker ) {
			return;
		}
		const bounds = new mapboxgl.LngLatBounds();
		points.forEach( point => {
			bounds.extend( [ point.coordinates.longitude, point.coordinates.latitude ] );
		} );

		// If there are multiple points, zoom is determined by the area they cover, and zoom control is removed.
		if ( points.length > 1 ) {
			map.fitBounds( bounds, {
				padding: {
					top: 40,
					bottom: 40,
					left: 20,
					right: 20,
				},
			} );
			this.setState( { boundsSetProgrammatically: true } );
			map.removeControl( zoomControl );
			return;
		}
		// If there is only one point, center map around it.
		map.setCenter( bounds.getCenter() );

		// If the number of markers has just changed from > 1 to 1, set an arbitrary tight zoom, which feels like the original default.
		if ( boundsSetProgrammatically ) {
			const newZoom = 12;
			map.setZoom( newZoom );
			onSetZoom( newZoom );
		} else {
			// If there are one (or zero) points, and this is not a recent change, respect user's chosen zoom.
			map.setZoom( parseInt( zoom, 10 ) );
		}
		map.addControl( zoomControl );
		this.setState( { boundsSetProgrammatically: false } );
	};
	getMapStyle() {
		const { mapStyle, mapDetails } = this.props;
		return mapboxMapFormatter( mapStyle, mapDetails );
	}
	getMapType() {
		const { mapStyle } = this.props;
		switch ( mapStyle ) {
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
		const { mapCenter, points } = this.props;
		this.setState( { loaded: true } );

		// If the map has any points, skip geolocation and use what we have.
		if ( points.length > 0 ) {
			this.initMap( mapCenter );
			return;
		}
		this.initMap( mapCenter );
	};
	loadMapLibraries() {
		const { apiKey } = this.props;
		Promise.all( [
			import( /* webpackChunkName: "map/mapbox-gl" */ 'mapbox-gl' ),
			import( /* webpackChunkName: "map/mapbox-gl" */ 'mapbox-gl/dist/mapbox-gl.css' ),
		] ).then( ( [ { default: mapboxgl } ] ) => {
			mapboxgl.accessToken = apiKey;
			this.setState( { mapboxgl: mapboxgl }, this.scriptsLoaded );
		} );
	}
	initMap( mapCenter ) {
		const { mapboxgl } = this.state;
		const { zoom, onMapLoaded, onError, admin } = this.props;
		let map = null;
		try {
			map = new mapboxgl.Map( {
				container: this.mapRef.current,
				style: this.getMapStyle(),
				center: this.googlePoint2Mapbox( mapCenter ),
				zoom: parseInt( zoom, 10 ),
				pitchWithRotate: false,
				attributionControl: false,
				dragRotate: false,
			} );
		} catch ( e ) {
			onError( 'mapbox_error', e.message );
			return;
		}
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
			this.debouncedSizeMap();
			map.addControl( zoomControl );
			if ( ! admin ) {
				map.addControl( new mapboxgl.FullscreenControl() );
			}
			this.mapRef.current.addEventListener( 'alignmentChanged', this.debouncedSizeMap );
			map.resize();
			onMapLoaded();
			this.setState( { loaded: true } );
			window.addEventListener( 'resize', this.debouncedSizeMap );
		} );
	}
	googlePoint2Mapbox( google_point ) {
		const mapCenter = [
			google_point.longitude ? google_point.longitude : 0,
			google_point.latitude ? google_point.latitude : 0,
		];
		return mapCenter;
	}
}

Map.defaultProps = {
	points: [],
	mapStyle: 'default',
	zoom: 13,
	onSetZoom: () => {},
	onMapLoaded: () => {},
	onMarkerClick: () => {},
	onError: () => {},
	markerColor: 'red',
	apiKey: null,
	mapCenter: {},
};

export default Map;
