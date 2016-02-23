/**
 * External dependencies
 */
var React = require( 'react' ), // eslint-disable-line no-unused-vars
	debug = require( 'debug' )( 'calypso:my-sites:upgrades:checkout:transaction-steps-mixin' ),
	flatten = require( 'lodash/flatten' ),
	values = require( 'lodash/values' ),
	pick = require( 'lodash/pick' ),
	defer = require( 'lodash/defer' ),
	isEqual = require( 'lodash/isEqual' ),
	page = require( 'page' );

/**
 * Internal dependencies
 */
var analytics = require( 'analytics' ),
	adTracking = require( 'analytics/ad-tracking' ),
	notices = require( 'notices' ),
	isFree = require( 'lib/cart-values' ).isFree,
	cartItems = require( 'lib/cart-values' ).cartItems,
	ValidationErrorList = require( 'notices/validation-error-list' ),
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

	getErrorFromApi: function( errorMessage ) {
		if ( errorMessage ) {
			const errorArray = errorMessage.split( /<a href="(.+)">(.+)<\/a>/ );

			if ( errorArray.length === 4 ) { // This assumes we have only one link
				const errorText1 = errorArray[ 0 ],
					errorUrl = errorArray[ 1 ],
					errorLinkText = errorArray[ 2 ],
					errorText2 = errorArray[ 3 ];

				return (
					<span>
						{ errorText1 } <a href={ errorUrl }>{ errorLinkText }</a> { errorText2 }
					</span>
				);
			}

			return errorMessage;
		}

		return this.translate( 'There was a problem completing the checkout. Please try again.' );
	},

	_displayNotices: function( cart, step ) {
		if ( step.error ) {
			if ( typeof step.error.message === 'object' ) {
				notices.error( <ValidationErrorList messages={ flatten( values( step.error.message ) ) } /> );
			} else {
				notices.error( this.getErrorFromApi( step.error.message ) )
			}

			return;
		}

		switch ( step.name ) {
			case 'input-validation':
				if ( ! cartItems.hasFreeTrial( cart ) ) {
					notices.info( isFree( cart ) ? this.translate( 'Submitting' ) : this.translate( 'Submitting payment' ) );
				}
				break;

			case 'received-wpcom-response':
				notices.clearNotices( 'notices' );
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
						cartValue.products.map( adTracking.recordPurchase );
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
