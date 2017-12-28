/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDom from 'react-dom';
import { localize } from 'i18n-calypso';
import Dispatcher from 'client/dispatcher';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import CartBody from 'client/my-sites/checkout/cart/cart-body';
import CartMessages from './cart-messages';
import CartSummaryBar from 'client/my-sites/checkout/cart/cart-summary-bar';
import CartPlanAd from './cart-plan-ad';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import Sidebar from 'client/layout/sidebar';
import observe from 'client/lib/mixins/data-observe';
import CartBodyLoadingPlaceholder from 'client/my-sites/checkout/cart/cart-body/loading-placeholder';
import { action as upgradesActionTypes } from 'client/lib/upgrades/constants';
import scrollIntoViewport from 'client/lib/scroll-into-viewport';

const SecondaryCart = createReactClass( {
	displayName: 'SecondaryCart',

	propTypes: {
		cart: PropTypes.object.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
	},

	mixins: [ observe( 'sites' ) ],

	getInitialState() {
		return {
			cartVisible: false,
		};
	},

	componentWillMount() {
		this.dispatchToken = Dispatcher.register(
			function( payload ) {
				if ( payload.action.type === upgradesActionTypes.CART_ON_MOBILE_SHOW ) {
					this.setState( { cartVisible: payload.action.show } );
				}
			}.bind( this )
		);
	},

	componentWillUnmount() {
		Dispatcher.unregister( this.dispatchToken );
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( ! prevState.cartVisible && this.state.cartVisible ) {
			const node = ReactDom.findDOMNode( this.refs.cartBody );
			scrollIntoViewport( node );
		}
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
				<CartBody ref="cartBody" cart={ cart } selectedSite={ selectedSite } showCoupon={ true } />
				<CartPlanDiscountAd cart={ cart } selectedSite={ selectedSite } />
			</Sidebar>
		);
	},
} );

export default localize( SecondaryCart );
