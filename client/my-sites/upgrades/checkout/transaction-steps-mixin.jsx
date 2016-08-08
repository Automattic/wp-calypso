/**
 * External dependencies
 */
var React = require( 'react' ), // eslint-disable-line no-unused-vars
	debug = require( 'debug' )( 'calypso:my-sites:upgrades:checkout:transaction-steps-mixin' ),
	pick = require( 'lodash/pick' ),
	defer = require( 'lodash/defer' ),
	isEqual = require( 'lodash/isEqual' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var analytics = require( 'lib/analytics' ),
	adTracking = require( 'lib/analytics/ad-tracking' ),
	isFree = require( 'lib/cart-values' ).isFree,
	cartItems = require( 'lib/cart-values' ).cartItems,
	upgradesNotices = require( 'lib/upgrades/notices' ),
	upgradesActions = require( 'lib/upgrades/actions' );

var TransactionStepsMixin = {
	submitTransaction: function( event ) {
		event.preventDefault();

		upgradesActions.submitTransaction(
			pick( this.props, [ 'cart', 'transaction' ] )
		);
	},

	componentWillReceiveProps: function( nextProps ) {
		var prevStep = this.props.transaction.step,
			nextStep = nextProps.transaction.step;

		if ( ! isEqual( prevStep, nextStep ) ) {
			this._handleTransactionStep( nextProps );
		}
	},

	_handleTransactionStep: function( { cart, selectedSite, transaction } ) {
		var step = transaction.step;

		debug( 'transaction step: ' + step.name );

		this._displayNotices( cart, step );
		this._recordAnalytics( step );

		this._finishIfLastStep( cart, selectedSite, step );
	},

	_displayNotices: function( cart, step ) {
		if ( step.error ) {
			upgradesNotices.displayError( step.error );
			return;
		}

		switch ( step.name ) {
			case 'input-validation':
				if ( ! cartItems.hasFreeTrial( cart ) ) {
					upgradesNotices.displaySubmitting( { isFreeCart: isFree( cart ) } );
				}
				break;

			case 'received-wpcom-response':
				upgradesNotices.clear();
				break;
		}
	},

	_recordAnalytics: function( step ) {
		var cartValue = this.props.cart;

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
						cartValue.products.forEach( product => {
							adTracking.recordPurchase( product, step.data.receipt_id );
						} );
						adTracking.recordOrderInAtlas( cartValue, step.data.receipt_id );
						adTracking.recordConversionInOneByAOL();
					}

					analytics.tracks.recordEvent( 'calypso_checkout_payment_success', {
						coupon_code: cartValue.coupon,
						currency: cartValue.currency,
						payment_method: this.props.transaction.payment.paymentMethod,
						total_cost: cartValue.total_cost
					} );

					cartValue.products.forEach( function( cartItem ) {
						analytics.tracks.recordEvent( 'calypso_checkout_product_purchase', cartItem );
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
		var cart = parameters.cart,
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
			page( this.props.redirectTo() );
		} );
	}
};

module.exports = TransactionStepsMixin;
