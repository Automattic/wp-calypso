/** @format */
/**
 * External dependencies
 */
import React from 'react';
import ReactDOM from 'react-dom';

export default class PlanFeaturesBottom extends React.PureComponent {
	getContainer() {
		if ( ! this.container || ! this.container.offsetWidth ) {
			this.container = document.querySelector( '.plans-features-main__bottom' );
		}

		return this.container;
	}

	render() {
		const { children } = this.props;
		const container = this.getContainer();

		if ( ! children || ! container ) {
			return null;
		}

		return ReactDOM.createPortal( children, container );
	}
}
