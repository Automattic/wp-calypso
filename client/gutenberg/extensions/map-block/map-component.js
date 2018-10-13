/** @format */

/**
 * Wordpress dependencies
 */

import {
	Component,
	createRef,
	Fragment
} from '@wordpress/element';

import {
	Button,
	Dashicon,
	TextareaControl,
	TextControl
} from '@wordpress/components';

/**
 * External dependencies
 */

import {
	get,
	clone,
	assign
} from 'lodash';

/**
 * Internal dependencies
 */

import { CONFIG } from './config.js';
import MapMarker from './map-marker/';
import InfoWindow from './info-window/';
import AddPoint from './add-point';

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
			google: null
		};

		// Event Handlers as methods
		this.sizeMap = this.sizeMap.bind( this );
		this.onMarkerClick = this.onMarkerClick.bind( this );
		this.deleteActiveMarker = this.deleteActiveMarker.bind( this );
		this.updateActiveMarker = this.updateActiveMarker.bind( this );
		this.addPoint = this.addPoint.bind( this );
		this.onMapClick = this.onMapClick.bind( this );
		this.setBoundsByMarkers = this.setBoundsByMarkers.bind( this );
		this.scriptsLoaded = this.scriptsLoaded.bind( this );

		// Refs
		this.mapRef = createRef();
		this.addPointRef = React.createRef();

	}

	render() {
		const {
			points,
			admin
		} = this.props;

		const {
			map,
			activeMarker,
			google,
		} = this.state;

		const {
			onMarkerClick,
			deleteActiveMarker,
			updateActiveMarker,
			addPoint
		} = this;

		const mapMarkers = ( map && google ) && points.map( ( point, index ) => {

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

		});

		const currentPoint = get( activeMarker, 'props.point' ) || {};

		const {
			title,
			caption
		} = currentPoint;

		const infoWindow = ( google ) &&
			(
				<InfoWindow
					activeMarker={ activeMarker }
					map={ map }
					google={ google.maps }
					unsetActiveMarker={ () => this.setState( { activeMarker: null } ) }
				>
					{ activeMarker && admin &&
						<Fragment>
							<TextControl
								label="Marker Title"
								value={ title }
								onChange={ ( title ) => updateActiveMarker( { title } ) }
							/>
							<TextareaControl
								className='wp-block-atavist-maps__marker-caption'
								label="Marker Caption"
								value={ caption }
								rows='3'
								tag='textarea'
								onChange={ ( caption ) => updateActiveMarker( { caption } ) }
							/>
							<Button
								onClick={ deleteActiveMarker }
								className='wp-block-atavist-maps__delete-btn'
							>
								<Dashicon icon='trash' size='15' /> Delete Marker
							</Button>
						</Fragment>
					}

					{ activeMarker && ! admin &&
						<Fragment>
							<h3>{ title }</h3>
							<p>{ caption }</p>
						</Fragment>
					}

				</InfoWindow>
			);

		return (
			<Fragment>
				<div className="map__map-container" ref={ this.mapRef }>
					{ mapMarkers }
				</div>
				{ infoWindow }
				{ admin &&
					<AddPoint onAddPoint={ addPoint } isVisible={ activeMarker ? false : true } ref={ this.addPointRef } />
				}
			</Fragment>
		);
	}

	componentDidMount() {

		this.loadMapLibraries();

	}

	// This implementation of componentDidUpdate is a reusable way to approximate Polymer observers
	componentDidUpdate( prevProps ) {

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

		const {
			map,
			google
		} = this.state;

		map.setOptions( {
			styles: this.getMapStyle(),
			mapTypeId: google.maps.MapTypeId[ this.getMapType() ],
		} );

	}

	// Event handling
	onMarkerClick( marker ) {

		this.setState( { activeMarker: marker } );
		this.setAddPointVisibility( false );

	}

	onMapClick() {

		this.setState( { activeMarker: null } );

	}

	addPoint( point ) {

		const { points } = this.props;
		const newPoints = clone( points );

		newPoints.push( point );
		this.props.onSetPoints( newPoints );

		this.setAddPointVisibility( false );

	}

	updateActiveMarker( updates) {

		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = clone( points );

		assign( newPoints[ index ], updates );
		this.props.onSetPoints( newPoints );

	}

	deleteActiveMarker() {

		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = clone( points );

		newPoints.splice( index, 1 );
		this.props.onSetPoints( newPoints );
		this.setState( { activeMarker: null } );

	}

	setAddPointVisibility( visible = true ) {

		if ( this.addPointRef.current ) {
			this.addPointRef.current.setState( { isVisible: visible } );
		}
		if ( visible ) {
			this.setState( { activeMarker: null } );
		}

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

		const {
			focus_mode,
			zoom,
			points
		} = this.props;

		const {
			map,
			activeMarker,
			google
		} = this.state;

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

		return CONFIG.styles[ this.props.map_style ].styles;

	}

	getMapType() {

		return CONFIG.styles[ this.props.map_style ].map_type;

	}

	getMarkerIcon() {

		const { marker_color } = this.props;
		const svgPath = {
		    path: 'M16,38 C16,38 32,26.692424 32,16 C32,5.307576 24.836556,0 16,0 C7.163444,0 0,5.307576 0,16 C0,26.692424 16,38 16,38 Z',
		    fillColor: marker_color,
		    fillOpacity: 0.8,
		    scale: 1,
		    strokeWeight: 0
		  };
	    return svgPath;

	}

	// Script loading, browser geolocation
	scriptsLoaded() {

		const {
			map_center,
			points
		} = this.props;

		this.setState({ loaded: true });

		// If the map has any points, skip geolocation and use what we have.
		if ( points.length > 0 ) {
			this.initMap( map_center );
			return;
		}

		// If there are no points, attempt to use geolocation to center the map on
		// the user's current location.

		const getMapCenter = () => {
			return new Promise(function (resolve, reject) {
				navigator.geolocation.getCurrentPosition(resolve, reject)
			})
		}
		getMapCenter()
			.then( ( position ) => {
				this.initMap( {
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				} );
			})
			.catch( ( err ) => {
		    	this.initMap( map_center );
		    } );
	}

	loadMapLibraries() {

		const { api_key } = this.props;

		const src = [
			'https://maps.googleapis.com/maps/api/js?key=',
			api_key,
			'&libraries=places' ].join( '' );

		if ( window.google ) {
			this.setState( { google: window.google }, this.scriptsLoaded );
			return;
		}

		loadScript( src, ( error ) => {
			if ( error ) {
				console.log( 'Script ' + error.src + ' failed to load.' );
				return;
			}
			this.setState( { google: window.google }, this.scriptsLoaded );
		} );

	}

	// Create the map object.
	initMap( map_center ) {

		const { google } = this.state;

		const {
			points,
			zoom
		} = this.props;

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

		const map = new google.maps.Map(
			this.mapRef.current,
			mapOptions
		);

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
			this.setAddPointVisibility( true );
			this.setState( { loaded: true } );

		});

	}
}

Map.defaultProps = {
	points: [],
	map_style: 'default',
	zoom: 13,
	onSetZoom: () => {},
	// Default center point is San Francisco
	map_center: {
		latitude: 37.7749295,
		longitude: -122.41941550000001
	},
	marker_color: 'red',
	api_key: null,
};

export default Map;
