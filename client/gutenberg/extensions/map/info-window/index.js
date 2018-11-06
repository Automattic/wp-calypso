/** @format */

/**
 * External dependencies
 */

import { Component, createPortal } from '@wordpress/element';

/**
 * Internal dependencies
 */

export class InfoWindow extends Component {
	componentDidMount() {
		const { map_service } = this.props;
		this.el = document.createElement( 'DIV' );
		this.infowindow = this.infoWindowForService( map_service, this.el );
	}
	infoWindowForService = ( map_service, el ) => {
		const { service_script } = this.props;
		let infowindow;
		switch ( map_service ) {
			case 'googlemaps':
				infowindow = new service_script.maps.InfoWindow( {
					content: el,
				} );
				service_script.maps.event.addListener( infowindow, 'closeclick', this.closeClick );
				break;
			case 'mapbox':
				infowindow = new service_script.Popup( {
					closeButton: true,
					closeOnClick: false,
					offset: {
						left: [ 0, 0 ],
						top: [ 0, 5 ],
						right: [ 0, 0 ],
						bottom: [ 0, -40 ],
					},
				} );
				infowindow.setDOMContent( el );
				infowindow.on( 'close', this.closeClick );
				break;
		}
		return infowindow;
	};
	componentDidUpdate( prevProps ) {
		if ( this.props.activeMarker !== prevProps.activeMarker ) {
			this.props.activeMarker ? this.openWindow() : this.closeWindow();
		}
	}
	render() {
		// Use React portal to render components directly into the info window.
		return this.el ? createPortal( this.props.children, this.el ) : null;
	}
	closeClick = () => {
		this.props.unsetActiveMarker();
	};
	openWindow() {
		const { map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				this.openWindowForGoogle();
				break;
			case 'mapbox':
				this.openWindowForMapbox();
				break;
		}
	}
	closeWindow() {
		const { map_service } = this.props;
		switch ( map_service ) {
			case 'googlemaps':
				this.closeWindowForGoogle();
				break;
			case 'mapbox':
				this.closeWindowForMapbox();
				break;
		}
	}
	openWindowForGoogle = () => {
		const { map, activeMarker } = this.props;
		this.infowindow.open( map, activeMarker.marker );
	};
	openWindowForMapbox = () => {
		const { map, activeMarker } = this.props;
		this.infowindow.setLngLat( activeMarker.getPoint() ).addTo( map );
	};
	closeWindowForGoogle = () => {
		this.infowindow.close();
	};
	closeWindowForMapbox = () => {
		this.infowindow.remove();
	};
}

InfoWindow.defaultProps = {
	unsetActiveMarker: () => {},
	activeMarker: null,
	map: null,
	service_script: null,
};

export default InfoWindow;
