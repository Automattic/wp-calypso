/** @format */
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
import { recordOrder } from 'lib/analytics/ad-tracking';
import { getTld } from 'lib/domains';
import { cartItems, getLocationOrigin } from 'lib/cart-values';
import { displayError, clear } from 'lib/upgrades/notices';
import { submitTransaction } from 'lib/upgrades/actions';
import { removeNestedProperties } from 'lib/cart/store/cart-analytics';
import { INPUT_VALIDATION } from 'lib/store-transactions/step-types';
import { REDIRECTING_FOR_AUTHORIZATION } from '../../../lib/store-transactions/step-types';

const TransactionStepsMixin = {
	submitTransaction: function( event ) {
		event.preventDefault();

		const params = pick( this.props, [ 'cart', 'transaction' ] );
		const origin = getLocationOrigin( window.location );

		params.successUrl = origin + this.props.redirectTo();
		params.cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			params.cancelUrl += this.props.selectedSite.slug;
		} else {
			params.cancelUrl += 'no-site';
		}

		submitTransaction( params );
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
			step.name !== INPUT_VALIDATION && displayError( step.error );
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
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', {
						reason: step.error.code,
					} );
				} else {
					analytics.tracks.recordEvent( 'calypso_checkout_form_submit', {
						credits: cartValue.credits,
						payment_method: this.props.transaction.payment.paymentMethod,
					} );
				}
				break;

			case REDIRECTING_FOR_AUTHORIZATION:
				// TODO: wire in payment method
				analytics.tracks.recordEvent( 'calypso_checkout_form_redirect' );
				break;

			case 'received-wpcom-response':
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', {
						reason: this._formatError( step.error ),
					} );

					this._recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: false,
					} );
				} else if ( step.data ) {
					// Makes sure free trials are not recorded as purchases in ad trackers since they are products with
					// zero-value cost and would thus lead to a wrong computation of conversions
					if ( ! cartItems.hasFreeTrial( cartValue ) ) {
						recordOrder( cartValue, step.data.receipt_id );
					}

					analytics.tracks.recordEvent( 'calypso_checkout_payment_success', {
						coupon_code: cartValue.coupon,
						currency: cartValue.currency,
						payment_method: this.props.transaction.payment.paymentMethod,
						total_cost: cartValue.total_cost,
					} );

					cartValue.products.forEach( function( cartItem ) {
						analytics.tracks.recordEvent(
							'calypso_checkout_product_purchase',
							removeNestedProperties( cartItem )
						);
					} );

					this._recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: true,
					} );
				}
				break;

			default:
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', {
						reason: this._formatError( step.error ),
					} );
				}
		}
	},

	_recordDomainRegistrationAnalytics: function( parameters ) {
		const cart = parameters.cart,
			success = parameters.success;

		cartItems.getDomainRegistrations( cart ).forEach( function( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_domain_registration', {
				domain_name: cartItem.meta,
				domain_tld: getTld( cartItem.meta ),
				success: success,
			} );
		} );
	},

	_finishIfLastStep: function( cart, selectedSite, step ) {
		if ( ! step.last || step.error ) {
			return;
		}

		if ( step.data.redirect_url ) {
			this.props.handleCheckoutExternalRedirect( step.data.redirect_url );
		} else {
			defer( () => {
				// The Thank You page throws a rendering error if this is not in a defer.
				this.props.handleCheckoutCompleteRedirect();
			} );
		}
	},

	_formatError: function( error ) {
		let formatedMessage = '';

		if ( typeof error.message === 'object' ) {
			formatedMessage += Object.keys( error.message ).join( ', ' );
		} else if ( typeof error.message === 'string' ) {
			formatedMessage += error.message;
		}

		if ( error.error ) {
			formatedMessage = error.error + ': ' + formatedMessage;
		}

		return formatedMessage;
	},
};

export default TransactionStepsMixin;
