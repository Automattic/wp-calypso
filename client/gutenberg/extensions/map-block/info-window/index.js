/**
 * Wordpress dependencies
 */

import { Component, renderToString, render, Fragment, createPortal } from '@wordpress/element';
import ReactDOM from 'react-dom';

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

export class InfoWindow extends Component {

	componentDidMount() {
		this.el = document.createElement( 'DIV' );
		this.infowindow = new google.maps.InfoWindow( {
      		content: this.el
    	} );
	}

	componentDidUpdate( prevProps ) {
	    if ( this.props.activeMarker !== prevProps.activeMarker ) {
      		this.props.activeMarker ?
        		this.openWindow() :
        		this.closeWindow();
    	}
	}

	render() {
		return this.el ?
			createPortal(
		    	this.props.children,
		    	this.el,
		    ) : null;
	}

	openWindow() {
		this.infowindow
      		.open( this.props.map, this.props.activeMarker.marker );
	}

	closeWindow() {
		this.infowindow.close();
	}
}

InfoWindow.defaultProps = {
	activeMarker: null,
	map: null
}

export default InfoWindow;
