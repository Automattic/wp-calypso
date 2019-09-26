/**
 * External dependencies
 */
import { Component } from 'react';
import ReactDOM from 'react-dom';

export default class MobileSelectPortal extends Component {
	constructor( props ) {
		super( props );
		this.mobileWrapper = this.getMobileWrapper();
	}
	getMobileWrapper = () => {
		return document.querySelector( '.filterbar__mobile-wrap' );
	};
	hasMobileWrapper = () => {
		if ( this.mobileWrapper ) {
			return true;
		}
		this.mobileWrapper = this.getMobileWrapper();
		if ( this.mobileWrapper ) {
			return true;
		}
		return false;
	};
	render() {
		if ( this.props.isVisible && this.hasMobileWrapper() ) {
			return ReactDOM.createPortal( this.props.children, this.mobileWrapper );
		}
		return null;
	}
}
