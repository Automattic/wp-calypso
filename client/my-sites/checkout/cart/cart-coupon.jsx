/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { isEmpty, trim } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { getABTestVariation } from 'lib/abtest';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import analytics from 'lib/analytics';
import { applyCoupon } from 'lib/upgrades/actions';

export class CartCoupon extends React.Component {
	static displayName = 'CartCoupon';

	constructor( props ) {
		super( props );

		this.state = {
			couponInputValue: this.appliedCouponCode,
			userChangedCoupon: false,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.userChangedCoupon ) {
			this.setState( { couponInputValue: nextProps.cart.coupon } );
		}
	}

	render() {
		if ( this.appliedCouponCode ) {
			return this.renderAppliedCoupon();
		}

		return this.renderApplyCouponUI();
	}

	get appliedCouponCode() {
		return this.props.cart.is_coupon_applied && this.props.cart.coupon
			? this.props.cart.coupon
			: null;
	}

	renderAppliedCoupon() {
		return (
			<div className="cart__coupon">
				<span className="cart__details">
					{ this.props.translate( 'Coupon applied: %(coupon)s', {
						args: { coupon: this.appliedCouponCode },
					} ) }
				</span>{' '}
				<button onClick={ this.clearCoupon } className="button is-link cart__remove-link">
					{ this.props.translate( 'Remove' ) }
				</button>
			</div>
		);
	}

	renderApplyCouponUI() {
		if ( this.props.cart.total_cost === 0 ) {
			return null;
		}

		const isProminent = 'prominent' === getABTestVariation( 'couponCodeMoreProminent' );
		const className = classNames(
			'cart__coupon',
			isProminent ? 'is-test-more-prominent' : 'is-test-control',
			{
				'is-unfolded': this.state.isCouponFormShowing,
			}
		);
		return (
			<div className={ className }>
				<button onClick={ this.toggleCouponDetails } className="button is-link cart__toggle-link">
					{ this.props.translate( 'Have a coupon code?' ) }
				</button>

				{ this.renderCouponForm() }
			</div>
		);
	}

	renderCouponForm = () => {
		const isProminent = 'prominent' === getABTestVariation( 'couponCodeMoreProminent' );
		const props = {};
		if ( ! isProminent ) {
			props.autoFocus = true;
		}
		return (
			<form onSubmit={ this.applyCoupon } className={ 'cart__form' }>
				<input
					type="text"
					disabled={ this.isSubmitting }
					placeholder={ this.props.translate( 'Enter Coupon Code', { textOnly: true } ) }
					onChange={ this.handleCouponInputChange }
					value={ this.state.couponInputValue }
					{ ...props }
				/>
				<Button
					type="submit"
					disabled={ isEmpty( trim( this.state.couponInputValue ) ) }
					busy={ this.isSubmitting }
				>
					{ this.props.translate( 'Apply' ) }
				</Button>
			</form>
		);
	};

	toggleCouponDetails = event => {
		event.preventDefault();

		this.setState( { isCouponFormShowing: ! this.state.isCouponFormShowing } );

		if ( this.state.isCouponFormShowing ) {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Hide Coupon Code Link' );
		} else {
			analytics.ga.recordEvent( 'Upgrades', 'Clicked Show Coupon Code Link' );
		}
	};

	get isSubmitting() {
		return ! this.props.cart.is_coupon_applied && this.props.cart.coupon ? true : false;
	}

	clearCoupon = event => {
		event.preventDefault();
		event.stopPropagation();
		this.setState(
			{
				couponInputValue: '',
			},
			() => {
				this.applyCoupon( event );
			}
		);
	};

	applyCoupon = event => {
		event.preventDefault();
		if ( this.isSubmitting ) {
			return;
		}

		analytics.tracks.recordEvent( 'calypso_checkout_coupon_submit', {
			coupon_code: this.state.couponInputValue,
		} );

		applyCoupon( this.state.couponInputValue );
	};

	handleCouponInputChange = event => {
		this.setState( {
			userChangedCoupon: true,
			couponInputValue: event.target.value,
		} );
	};
}

export default localize( CartCoupon );
