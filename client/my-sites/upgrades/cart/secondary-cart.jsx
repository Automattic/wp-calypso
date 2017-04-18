/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Dispatcher from 'dispatcher';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CartBody from 'my-sites/upgrades/cart/cart-body';
import CartMessagesMixin from './cart-messages-mixin';
import CartSummaryBar from 'my-sites/upgrades/cart/cart-summary-bar';
import CartPlanAd from './cart-plan-ad';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import Sidebar from 'layout/sidebar';
import observe from 'lib/mixins/data-observe';
import CartBodyLoadingPlaceholder from 'my-sites/upgrades/cart/cart-body/loading-placeholder';
import { action as upgradesActionTypes } from 'lib/upgrades/constants';

const SecondaryCart = React.createClass( {
	propTypes: {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [
			PropTypes.bool,
			PropTypes.object
		] )
	},

	mixins: [ CartMessagesMixin, observe( 'sites' ) ],

	getInitialState() {
		return {
			cartVisible: false,
		};
	},

	componentWillMount() {
		this.dispatchToken = Dispatcher.register( function( payload ) {
			if ( payload.action.type === upgradesActionTypes.CART_ON_MOBILE_SHOW ) {
				this.setState( { cartVisible: payload.action.show } );
			}
		}.bind( this ) );
	},

	componentWillUnmount() {
		Dispatcher.unregister( this.dispatchToken );
	},

	render() {
		const { cart, selectedSite } = this.props;
		const cartClasses = classNames( {
			'secondary-cart': true,
			'secondary-cart__hidden': ! this.state.cartVisible,
		} );

		if ( ! cart.hasLoadedFromServer ) {
			return (
				<Sidebar className={ cartClasses }>
					<CartSummaryBar additionalClasses="cart-header" />
					<CartBodyLoadingPlaceholder />
				</Sidebar>
			);
		}

		return (
			<Sidebar className={ cartClasses }>
				<CartSummaryBar additionalClasses="cart-header" />
				<CartPlanAd
					selectedSite={ selectedSite }
					cart={ cart } />
				<CartBody
					cart={ cart }
					selectedSite={ selectedSite }
					showCoupon={ true } />
				<CartPlanDiscountAd
					cart={ cart }
					selectedSite={ selectedSite } />
			</Sidebar>
		);
	}
} );

export default localize( SecondaryCart );
