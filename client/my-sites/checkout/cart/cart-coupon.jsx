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
import { applyCoupon, removeCoupon } from 'lib/upgrades/actions';

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

		return this.renderCouponForm();
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

	renderCouponForm() {
		if ( this.props.cart.total_cost === 0 ) {
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

	clearCoupon = event => {
		event.preventDefault();
		event.stopPropagation();
		this.setState(
			{
				couponInputValue: '',
			},
			() => {
				this.removeCoupon( event );
			}
		);
	};

	applyCoupon = event => {
		event.preventDefault();

		if ( this.isSubmitting ) {
			return;
		}

		this.props.applyCoupon( this.state.couponInputValue );
	};

	removeCoupon = event => {
		event.preventDefault();

		if ( this.isSubmitting ) {
			return;
		}

		this.props.removeCoupon();
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
	removeCoupon: () => {
		dispatch( recordTracksEvent( 'calypso_checkout_coupon_submit', { coupon_code: '' } ) );
		removeCoupon();
	},
} );

export default connect(
	null,
	mapDispatchToProps
)( localize( CartCoupon ) );
