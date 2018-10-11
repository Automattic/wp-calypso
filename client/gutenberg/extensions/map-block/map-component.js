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
	TextControl,
	Button
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

const $ = window.jQuery;

export class Map extends Component {

	constructor() {
		super( ...arguments );
		this.mapRef = createRef();
		this.state = {
			map: null,
			fit_to_bounds: false,
			loaded: false
		};
		this.sizeMap = this.sizeMap.bind( this );
		this.onMarkerClick = this.onMarkerClick.bind( this );
		this.deleteActiveMarker = this.deleteActiveMarker.bind( this );
		this.updateActiveMarker = this.updateActiveMarker.bind( this );
		this.addPoint = this.addPoint.bind( this );
		this.onMapClick = this.onMapClick.bind( this );
		this.setBoundsByMarkers = this.setBoundsByMarkers.bind( this );

		this.addPointRef = React.createRef();
	}

	onMarkerClick( marker ) {
		this.setState( { activeMarker: marker } );
		this.setAddPointVisibility( false );
	}

	onMapClick() {
		this.setState( { activeMarker: null } );
	}

	addPoint( point ) {
		this.setAddPointVisibility( false );
		const { points } = this.props;
		const newPoints = clone( points );
		newPoints.push( point );
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

	updateActiveMarker( updates) {
		const { points } = this.props;
		const { activeMarker } = this.state;
		const { index } = activeMarker.props;
		const newPoints = clone( points );
		assign( newPoints[ index ], updates );
		this.props.onSetPoints( newPoints );
	}

	setAddPointVisibility( visible = true ) {
		if ( this.addPointRef.current ) {
			this.addPointRef.current.setState( { isVisible: visible } );
		}
		if ( visible ) {
			this.setState( { activeMarker: null } );
		}
	}

	render() {
		const {
			points,
			admin
		} = this.props;

		const {
			map,
			activeMarker
		} = this.state;

		const {
			onMarkerClick,
			deleteActiveMarker,
			updateActiveMarker,
			addPoint
		} = this;

		const mapMarkers = points.map( ( point, index ) => {
			if ( window.google ) {
				return (
					<MapMarker
						key={ index }
						point={ point }
						index={ index }
						map={ map }
						google={ window.google.maps }
						icon={ this.getMarkerIcon() }
						onClick={ onMarkerClick }
					/>
				);
			}
		});
		const point = get( activeMarker, 'props.point' ) || {};

		const {
			title,
			caption
		} = point;

		const infoWindow = window.google ?
			(
				<InfoWindow
					activeMarker={ activeMarker }
					map={ map }
					google={ window.google.maps }
				>
					{ activeMarker && admin &&
						<Fragment>
							<TextControl
								label="Marker Title"
								value={ point.title }
								onChange={ ( title ) => updateActiveMarker( { title } ) }
							/>
							<TextControl
								label="Marker Caption"
								value={ point.caption }
								onChange={ ( caption ) => updateActiveMarker( { caption } ) }
							/>
							<Button
								onClick={ deleteActiveMarker }
							>Delete Point</Button>
						</Fragment>
					}

					{ activeMarker && ! admin &&
						<Fragment>
							<h3>{ point.title }</h3>
							<p>{ point.caption }</p>
						</Fragment>
					}

				</InfoWindow>
			) : null;
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
	/* Observers */

	/* This implementation of componentDidUpdate is a reusable way to approximate Polymer observers */
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

	pointsChanged() {
		this.setBoundsByMarkers();
	}

	map_styleChanged() {
		const { map } = this.state;
		if ( ! map ) {
			return;
		}
		map.setOptions( {
			styles: this.getMapStyle(),
			mapTypeId: window.google.maps.MapTypeId[ this.getMapType() ],
		} );
	}

	setBoundsByMarkers() {
		const {
			focus_mode,
			zoom,
			points
		} = this.props;

		const {
			map,
			activeMarker
		} = this.state;

		if ( ! map || focus_mode.type !== 'fit_markers' || points.length === 0 ) {
			return;
		}

		if ( activeMarker ) {
			return;
		}

		const bounds = new window.google.maps.LatLngBounds();
		points.forEach( point => {
			bounds.extend(
				new window.google.maps.LatLng( point.coordinates.latitude, point.coordinates.longitude )
			);
		} );

		map.setCenter( bounds.getCenter() );
		map.fitBounds( bounds );
		if ( points.length > 1 ) {
			this.setState( { fit_to_bounds: true } );
			map.setOptions( { zoomControl: false } );
		} else {
			map.setZoom( parseInt( zoom, 10 ) );
			this.setState( { fit_to_bounds: false } );
			map.setOptions( { zoomControl: true } );
		}
	}

	getMapStyle() {
		return CONFIG.styles[ this.props.map_style ].styles;
	}

	getMapType() {
		return CONFIG.styles[ this.props.map_style ].map_type;
	}

	loadMapLibraries() {
		let atavistGoogleMapsLoaded = window.atavistGoogleMapsLoaded;
		window.atavistGoogleMapInit = function() {
			atavistGoogleMapsLoaded.resolve();
		};
		const scriptsToLoad = [];
		if ( ! window.atavistGoogleMapsLoaded ) {
			atavistGoogleMapsLoaded = $.Deferred();
			if ( typeof google === 'undefined' ) {
				scriptsToLoad.push(
					window.jQuery.getScript(
						'https://maps.googleapis.com/maps/api/js?key=' +
							this.props.api_key +
							'&libraries=places&callback=atavistGoogleMapInit'
					)
				);
			} else {
				atavistGoogleMapsLoaded.resolve();
			}
		}

		atavistGoogleMapsLoaded.done(
			function() {
				this.init();
				this.setState( { loaded: true } );
			}.bind( this )
		);
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

	sizeMap() {
		const blockWidth = $( this.mapRef.current ).width();
		const maxHeight = window.innerHeight * 0.8;
		const blockHeight = Math.min( blockWidth * ( 3 / 4 ), maxHeight );
		this.mapRef.current.style.height = blockHeight + 'px';
	}

	init() {
		const {
			points,
			zoom,
			map_center
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
			mapTypeId: window.google.maps.MapTypeId[ this.getMapType() ],
			zoom: parseInt( zoom, 10 ),
		};

		const map = new window.google.maps.Map(
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
			window.google.maps.event.trigger( map, 'resize' );
			map.setCenter( new window.google.maps.LatLng( map_center.latitude, map_center.longitude ) );
			this.setBoundsByMarkers();
			this.setAddPointVisibility( true );
		});
	}
}

Map.defaultProps = {
	points: [],
	map_style: 'default',
	zoom: 13,
	onSetZoom: () => {},
	map_center: {
		latitude: 37.7749295,
		longitude: -122.41941550000001
	},
	focus_mode: {
		type: 'fit_markers',
	},
	marker_color: 'red',
	api_key: null,
};

export default Map;
