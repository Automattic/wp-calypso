/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { identity } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AnalyticsMixin from 'lib/mixins/analytics';

/* eslint-disable react/prefer-es6-class */
export const CartButtons = createReactClass( {
	displayName: 'CartButtons',
	mixins: [ AnalyticsMixin( 'popupCart' ) ],

	propTypes: {
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
		translate: PropTypes.func.isRequired,
	},

	getDefaultProps() {
		return {
			translate: identity,
		};
	},

	render() {
		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className="cart-buttons">
				<button className="cart-checkout-button button is-primary" onClick={ this.goToCheckout }>
					{ this.props.translate( 'Checkout', { context: 'Cart button' } ) }
				</button>
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	},

	goToCheckout( event ) {
		event.preventDefault();

		this.recordEvent( 'checkoutButtonClick' );

		page( '/checkout/' + this.props.selectedSite.slug );
	},
} );

export default localize( CartButtons );
