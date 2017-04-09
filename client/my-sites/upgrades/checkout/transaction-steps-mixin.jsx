/**
 * External dependencies
 */
import React from 'react'; // eslint-disable-line no-unused-vars
import debugFactory from 'debug';
import { defer, isEqual, pick } from 'lodash';

const debug = debugFactory( 'calypso:my-sites:upgrades:checkout:transaction-steps-mixin' );

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import adTracking from 'lib/analytics/ad-tracking';
import { cartItems } from 'lib/cart-values';
import { displayError, clear } from 'lib/upgrades/notices';
import upgradesActions from 'lib/upgrades/actions';
import { removeNestedProperties } from 'lib/cart/store/cart-analytics';

const TransactionStepsMixin = {
	submitTransaction: function( event ) {
		event.preventDefault();

		upgradesActions.submitTransaction(
			pick( this.props, [ 'cart', 'transaction' ] )
		);
	},

	componentWillReceiveProps: function( nextProps ) {
		const prevStep = this.props.transaction.step,
			nextStep = nextProps.transaction.step;

		if ( ! isEqual( prevStep, nextStep ) ) {
			this._handleTransactionStep( nextProps );
		}
	},

	_handleTransactionStep: function( { cart, selectedSite, transaction } ) {
		const step = transaction.step;

		debug( 'transaction step: ' + step.name );

		this._displayNotices( cart, step );
		this._recordAnalytics( step );

		this._finishIfLastStep( cart, selectedSite, step );
	},

	_displayNotices: function( cart, step ) {
		if ( step.error ) {
			displayError( step.error );
			return;
		}

		switch ( step.name ) {
			case 'received-wpcom-response':
				clear();
				break;
		}
	},

	_recordAnalytics: function( step ) {
		const cartValue = this.props.cart;

		switch ( step.name ) {
			case 'input-validation':
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', { reason: step.error.code } );
				} else {
					analytics.tracks.recordEvent( 'calypso_checkout_form_submit', {
						credits: cartValue.credits,
						payment_method: this.props.transaction.payment.paymentMethod
					} );
				}
				break;

			case 'received-wpcom-response':
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', { reason: step.error.message } );

					this._recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: false
					} );
				} else if ( step.data ) {
					// Makes sure free trials are not recorded as purchases in ad trackers since they are products with
					// zero-value cost and would thus lead to a wrong computation of conversions
					if ( ! cartItems.hasFreeTrial( cartValue ) ) {
						adTracking.recordOrder( cartValue, step.data.receipt_id );
					}

					analytics.tracks.recordEvent( 'calypso_checkout_payment_success', {
						coupon_code: cartValue.coupon,
						currency: cartValue.currency,
						payment_method: this.props.transaction.payment.paymentMethod,
						total_cost: cartValue.total_cost
					} );

					cartValue.products.forEach( function( cartItem ) {
						analytics.tracks.recordEvent( 'calypso_checkout_product_purchase', removeNestedProperties( cartItem ) );
					} );

					this._recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: true
					} );
				}
				break;

			default:
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', { reason: step.error.message } );
				}
		}
	},

	_recordDomainRegistrationAnalytics: function( parameters ) {
		const cart = parameters.cart,
			success = parameters.success;

		cartItems.getDomainRegistrations( cart ).forEach( function( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_domain_registration', {
				domain_tld: cartItems.getDomainRegistrationTld( cartItem ),
				success: success
			} );
		} );
	},

	_finishIfLastStep: function( cart, selectedSite, step ) {
		if ( ! step.last || step.error ) {
			return;
		}

		defer( () => {
			// The Thank You page throws a rendering error if this is not in a defer.
			this.props.handleCheckoutCompleteRedirect();
		} );
	}
};

export default TransactionStepsMixin;
