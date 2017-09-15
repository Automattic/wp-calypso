/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import React from 'react';
import { identity, isFunction } from 'lodash';
import page from 'page';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AnalyticsMixin from 'lib/mixins/analytics';

export const CartButtons = React.createClass( {
	mixins: [ AnalyticsMixin( 'popupCart' ) ],

	propTypes: {
		selectedSite: PropTypes.oneOfType( [
			PropTypes.object,
			PropTypes.bool
		] ).isRequired,
		translate: PropTypes.func.isRequired
	},

	getDefaultProps() {
		return {
			showKeepSearching: false,
			translate: identity
		};
	},

	render() {
		return (
			<div className="cart-buttons">
				<button className="cart-checkout-button button is-primary"
						onClick={ this.goToCheckout }>
					{ this.props.translate( 'Checkout', { context: 'Cart button' } ) }
				</button>

				{ this.optionalKeepSearching() }
			</div>
		);
	},

	optionalKeepSearching() {
		if ( ! this.props.showKeepSearching ) {
			return;
		}

		return (
			<button className="cart-keep-searching-button button"
					onClick={ this.onKeepSearchingClick }>
				{ this.props.translate( 'Keep Searching' ) }
			</button>
		);
	},

	onKeepSearchingClick( event ) {
		event.preventDefault();
		this.recordEvent( 'keepSearchButtonClick' );
		if ( isFunction( this.props.onKeepSearchingClick ) ) {
			this.props.onKeepSearchingClick( event );
		}
	},

	goToCheckout( event ) {
		event.preventDefault();

		this.recordEvent( 'checkoutButtonClick' );

		page( '/checkout/' + this.props.selectedSite.slug );
	}
} );

export default localize( CartButtons );
