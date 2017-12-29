/** @format */

/**
 * External dependencies
 */

import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { applyCoupon } from 'lib/upgrades/actions';

class CartCoupon extends React.Component {
	static displayName = 'CartCoupon';

	constructor( props ) {
		super( props );
		var coupon = props.cart.coupon,
			cartHadCouponBeforeMount = Boolean( props.cart.coupon );

		this.state = {
			isCouponFormShowing: cartHadCouponBeforeMount,
			hasSubmittedCoupon: cartHadCouponBeforeMount,
			couponInputValue: coupon,
			userChangedCoupon: false,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.userChangedCoupon ) {
			this.setState( { couponInputValue: nextProps.cart.coupon } );
		}
	}

	toggleCouponDetails = event => {
		event.preventDefault();

		this.setState( { isCouponFormShowing: ! this.state.isCouponFormShowing } );

		if ( this.state.isCouponFormShowing ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Hide Coupon Code Link' );
		} else {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Show Coupon Code Link' );
		}
	};

	applyCoupon = event => {
		event.preventDefault();

		analytics.tracks.recordEvent( 'calypso_checkout_coupon_submit', {
			coupon_code: this.state.couponInputValue,
		} );

		this.setState( {
			userChangedCoupon: false,
			hasSubmittedCoupon: true,
		} );
		applyCoupon( this.state.couponInputValue );
	};

	handleCouponInput = event => {
		this.setState( {
			userChangedCoupon: true,
			couponInputValue: event.target.value,
		} );
	};

	getToggleLink = () => {
		if ( this.props.cart.total_cost === 0 ) {
			return;
		}

		if ( this.state.hasSubmittedCoupon ) {
			return;
		}

		return (
			<a href="" onClick={ this.toggleCouponDetails }>
				{ this.props.translate( 'Have a coupon code?' ) }
			</a>
		);
	};

	getCouponForm = () => {
		if ( ! this.state.isCouponFormShowing ) {
			return;
		}

		if ( this.state.hasSubmittedCoupon ) {
			return;
		}

		return (
			<form onSubmit={ this.applyCoupon }>
				<input
					type="text"
					placeholder={ this.props.translate( 'Enter Coupon Code', { textOnly: true } ) }
					onChange={ this.handleCouponInput }
					value={ this.state.couponInputValue }
				/>
				<button type="submit" className="button">
					{ this.props.translate( 'Apply' ) }
				</button>
			</form>
		);
	};

	render() {
		return (
			<div className="cart-coupon">
				{ this.getToggleLink() }
				{ this.getCouponForm() }
			</div>
		);
	}
}

export default localize( CartCoupon );
