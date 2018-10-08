/** @format */

/**
 * Wordpress dependencies
 */

import { Component, createRef } from '@wordpress/element';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

import { CONFIG } from './config.js';

const $ = window.jQuery;

export class Map extends Component {

	constructor() {
		super( ...arguments );
		this.mapRef = createRef();
		this.state = {
			map: null,
			fit_to_bounds: false,
			markers: [],
			infowindow: null,
		};
		this.mapStyles = CONFIG.styles;
		this.sizeMap = this.sizeMap.bind( this );
	}

	render() {
		return <div className="map__map-container" ref={ this.mapRef } />;
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

	marker_colorChanged() {
		const { points } = this.props;
		this.pointsChanged( points );
	}

	infoWindowFromPoint( point ) {
		const els = [];
		if ( point.title.replace( ' ', '' ).length > 0 ) {
			els.push( '<h3>' + point.title + '</h3>' );
		}
		if ( point.caption.replace( ' ', '' ).length > 0 ) {
			els.push( '<p>' + point.caption + '</caption>' );
		}
		return els.join( '' );
	}

	pointsChanged( points ) {
		const markers = [];
		const { map } = this.state;
		if ( typeof google === 'undefined' || typeof map === 'undefined' ) {
			return;
		}
		this.state.markers.forEach( marker => marker.setMap( null ) );
		const icon = this.getMarkerIcon();
		points.forEach( point => {
			const position = new window.google.maps.LatLng(
				point.coordinates.latitude,
				point.coordinates.longitude
			);
			const infowindow = new window.google.maps.InfoWindow( {
				content: this.infoWindowFromPoint( point ),
				maxWidth: 200,
			} );
			const marker = new window.google.maps.Marker( { position, map, icon, infowindow } );
			window.google.maps.event.addListener(
				marker,
				'click',
				function() {
					if ( this.state.infowindow ) {
						this.state.infowindow.close();
					}
					if ( infowindow.getContent().replace( ' ', '' ).length > 0 ) {
						infowindow.open( map, marker );
						this.setState( { infowindow } );
					}
				}.bind( this )
			);

			marker._infowindow = infowindow;
			markers.push( marker );
		} );

		this.setState( { markers }, this.setBoundsByMarkers );
	}

	setBoundsByMarkers() {
		const { focus_mode, zoom } = this.props;
		const { map, markers } = this.state;
		if ( ! map || focus_mode.type !== 'fit_markers' || markers.length === 0 ) {
			return;
		}

		const bounds = new window.google.maps.LatLngBounds();
		markers.forEach( marker => {
			bounds.extend(
				new window.google.maps.LatLng( marker.position.lat(), marker.position.lng() )
			);
		} );

		map.setCenter( bounds.getCenter() );
		map.fitBounds( bounds );
		if ( markers.length > 1 ) {
			this.setState( { fit_to_bounds: true } );
			map.setOptions( { zoomControl: false } );
		} else {
			map.setZoom( parseInt( zoom, 10 ) );
			this.setState( { fit_to_bounds: false } );
			map.setOptions( { zoomControl: true } );
		}
	}

	getMapStyle() {
		return this.mapStyles[ this.props.map_style ].styles;
	}

	getMapType() {
		return this.mapStyles[ this.props.map_style ].map_type;
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
			}.bind( this )
		);
	}

	getMarkerIcon() {
		const { marker_color } = this.props;
		const url =
			'https://atavist-static.s3.amazonaws.com/prototype_assets/map_marker_2x_' +
			marker_color +
			'.png';
		return new window.google.maps.MarkerImage(
			url,
			null,
			null,
			null,
			new window.google.maps.Size( 32, 40 )
		);
	}

	sizeMap() {
		const blockWidth = $( this.mapRef.current ).width();
		const maxHeight = window.innerHeight * 0.8;
		const blockHeight = Math.min( blockWidth * ( 3 / 4 ), maxHeight );
		this.mapRef.current.style.height = blockHeight + 'px';
	}

	init() {
		const { points, zoom, map_center } = this.props;
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
		const map = new window.google.maps.Map( this.mapRef.current, mapOptions );
		map.addListener(
			'zoom_changed',
			function() {
				this.props.onSetZoom( map.getZoom() );
			}.bind( this )
		);
		this.setState( { map } );

		setTimeout(
			function() {
				this.sizeMap();
				this.mapRef.current.addEventListener( 'alignmentChanged', this.sizeMap );
				window.addEventListener( 'resize', this.sizeMap );
				window.google.maps.event.trigger( map, 'resize' );
				map.setCenter( new window.google.maps.LatLng( map_center.latitude, map_center.longitude ) );
				this.pointsChanged( points );

				// TODO: This won't work as written!
				$( this ).on(
					'alignmentChanged afterSectionChange',
					function() {
						window.google.maps.event.trigger( map, 'resize' );
						this.pointsChanged( points );
					}.bind( this )
				);
			}.bind( this ),
			1000
		);
	}
}

Map.defaultProps = {
	points: [],
	map_style: 'default',
	zoom: 13,
	onSetZoom: () => {},
	map_center: {
		latitude: 40.7022937,
		longitude: -73.9863515,
	},
	focus_mode: {
		type: 'fit_markers',
	},
	marker_color: 'red',
	api_key: null,
};

export default Map;
