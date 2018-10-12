/**
 * Wordpress dependencies
 */

import {
	Component,
	Fragment,
	createPortal
} from '@wordpress/element';

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

		// Use React portal to render components directly into the Google Maps info window.
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
