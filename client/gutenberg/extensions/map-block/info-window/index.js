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
		const { google } = this.props;
		this.el = document.createElement( 'DIV' );
		this.infowindow = new google.maps.InfoWindow( {
			content: this.el,
		} );
		google.maps.event.addListener( this.infowindow, 'closeclick', this.closeClick );
	}
	componentDidUpdate( prevProps ) {
		if ( this.props.activeMarker !== prevProps.activeMarker ) {
			this.props.activeMarker ? this.openWindow() : this.closeWindow();
		}
	}
	render() {
		// Use React portal to render components directly into the Google Maps info window.
		return this.el ? createPortal( this.props.children, this.el ) : null;
	}
	closeClick = () => {
		this.props.unsetActiveMarker();
	};
	openWindow() {
		this.infowindow.open( this.props.map, this.props.activeMarker.marker );
	}
	closeWindow() {
		this.infowindow.close();
	}
}

InfoWindow.defaultProps = {
	unsetActiveMarker: () => {},
	activeMarker: null,
	map: null,
	google: null,
};

export default InfoWindow;
