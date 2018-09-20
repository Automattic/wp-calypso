/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import Dispatcher from 'dispatcher';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CartBody from 'my-sites/checkout/cart/cart-body';
import CartMessages from './cart-messages';
import CartSummaryBar from 'my-sites/checkout/cart/cart-summary-bar';
import CartPlanAd from './cart-plan-ad';
import CartPlanAdTheme from './cart-plan-ad-theme';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import Sidebar from 'layout/sidebar';
import CartBodyLoadingPlaceholder from 'my-sites/checkout/cart/cart-body/loading-placeholder';
import { CART_ON_MOBILE_SHOW } from 'lib/upgrades/action-types';
import scrollIntoViewport from 'lib/scroll-into-viewport';

class SecondaryCart extends Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	};

	state = {
		cartVisible: false,
	};

	componentWillMount() {
		this.dispatchToken = Dispatcher.register(
			function( payload ) {
				if ( payload.action.type === CART_ON_MOBILE_SHOW ) {
					this.setState( { cartVisible: payload.action.show } );
				}
			}.bind( this )
		);
	}

	componentWillUnmount() {
		Dispatcher.unregister( this.dispatchToken );
	}

	componentDidUpdate( prevProps, prevState ) {
		if ( ! prevState.cartVisible && this.state.cartVisible ) {
			const node = ReactDom.findDOMNode( this.cartBodyRef );
			scrollIntoViewport( node );
		}
	}

	setCartBodyRef = cartBody => {
		this.cartBodyRef = cartBody;
	};

	render() {
		const { cart, selectedSite } = this.props;
		const cartClasses = classNames( {
			'secondary-cart': true,
			'secondary-cart__hidden': ! this.state.cartVisible,
		} );

		if ( ! cart.hasLoadedFromServer ) {
			return (
				<Sidebar className={ cartClasses }>
					<CartMessages cart={ cart } selectedSite={ selectedSite } />
					<CartSummaryBar additionalClasses="cart-header" />
					<CartBodyLoadingPlaceholder />
				</Sidebar>
			);
		}

		return (
			<Sidebar className={ cartClasses }>
				<CartMessages cart={ cart } selectedSite={ selectedSite } />
				<CartSummaryBar additionalClasses="cart-header" />
				<CartPlanAd selectedSite={ selectedSite } cart={ cart } />
				<CartPlanAdTheme selectedSite={ selectedSite } cart={ cart } />
				<CartBody
					ref={ this.setCartBodyRef }
					cart={ cart }
					selectedSite={ selectedSite }
					showCoupon={ true }
				/>
				<CartPlanDiscountAd cart={ cart } selectedSite={ selectedSite } />
			</Sidebar>
		);
	}
}

export default localize( SecondaryCart );
