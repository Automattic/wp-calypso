/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import CartMessagesMixin from './cart-messages-mixin';
import CartPlanAd from './cart-plan-ad';
import CartPlanDiscountAd from './cart-plan-discount-ad';
import Dispatcher from 'dispatcher';
import Sidebar from 'layout/sidebar';
import observe from 'lib/mixins/data-observe';
import scrollIntoViewport from 'lib/scroll-into-viewport';
import { action as upgradesActionTypes } from 'lib/upgrades/constants';
import CartBody from 'my-sites/checkout/cart/cart-body';
import CartBodyLoadingPlaceholder from 'my-sites/checkout/cart/cart-body/loading-placeholder';
import CartSummaryBar from 'my-sites/checkout/cart/cart-summary-bar';

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
					ref="cartBody"
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
