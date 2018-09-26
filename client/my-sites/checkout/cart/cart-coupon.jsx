/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { isEmpty, trim } from 'lodash';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { recordTracksEvent, recordGoogleEvent } from 'state/analytics/actions';
import { applyCoupon } from 'lib/upgrades/actions';

export class CartCoupon extends React.Component {
	static displayName = 'CartCoupon';

	constructor( props ) {
		super( props );

		this.state = {
			isCouponFormShowing: false,
			couponInputValue: this.appliedCouponCode,
			userChangedCoupon: false,
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ! this.state.userChangedCoupon ) {
			this.setState( { couponInputValue: nextProps.cart.coupon } );
		}

		if ( nextProps.cart.is_coupon_applied && ! this.props.cart.coupon.is_coupon_applied ) {
			this.setState( { isCouponFormShowing: false, couponInputValue: '' } );
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
		return false;
	}

	renderApplyCouponUI() {
		if ( this.props.cart.total_cost === 0 ) {
			return null;
		}

		return (
			<div className="cart__coupon">
				<button onClick={ this.toggleCouponDetails } className="button is-link cart__toggle-link">
					{ this.props.translate( 'Have a coupon code?' ) }
				</button>

				{ this.renderCouponForm() }
			</div>
		);
	}

	renderCouponForm = () => {
		if ( ! this.state.isCouponFormShowing ) {
			return null;
		}

		return (
			<form onSubmit={ this.applyCoupon } className={ 'cart__form' }>
				<input
					type="text"
					data-e2e-type="coupon-code"
					disabled={ this.isSubmitting }
					placeholder={ this.props.translate( 'Enter Coupon Code', { textOnly: true } ) }
					onChange={ this.handleCouponInputChange }
					value={ this.state.couponInputValue }
					autoFocus // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<Button
					type="submit"
					data-e2e-type="apply-coupon"
					disabled={ isEmpty( trim( this.state.couponInputValue ) ) }
					busy={ this.isSubmitting }
				>
					{ this.props.translate( 'Apply' ) }
				</Button>
			</form>
		);
	};

	get isSubmitting() {
		return ! this.props.cart.is_coupon_applied && this.props.cart.coupon ? true : false;
	}

	toggleCouponDetails = event => {
		event.preventDefault();

		this.setState( { isCouponFormShowing: ! this.state.isCouponFormShowing } );

		if ( this.state.isCouponFormShowing ) {
			this.props.recordGoogleEvent( 'Upgrades', 'Clicked Hide Coupon Code Link' );
		} else {
			this.props.recordGoogleEvent( 'Upgrades', 'Clicked Show Coupon Code Link' );
		}
	};

	applyCoupon = event => {
		event.preventDefault();

		if ( this.isSubmitting ) {
			return;
		}

		this.props.applyCoupon( this.state.couponInputValue );
	};

	handleCouponInputChange = event => {
		this.setState( {
			userChangedCoupon: true,
			couponInputValue: event.target.value,
		} );
	};
}

const mapDispatchToProps = dispatch => ( {
	recordGoogleEvent,
	applyCoupon: coupon_code => {
		dispatch( recordTracksEvent( 'calypso_checkout_coupon_submit', { coupon_code } ) );
		applyCoupon( coupon_code );
	},
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( CartCoupon ) );
