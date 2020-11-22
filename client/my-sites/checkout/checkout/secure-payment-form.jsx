/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { get, defer, find, isEqual } from 'lodash';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import notices from 'calypso/notices';
import EmptyContent from 'calypso/components/empty-content';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import { submit } from 'calypso/lib/store-transactions';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { setPayment, setTransactionStep } from 'calypso/lib/transaction/actions';
import {
	fullCreditsPayment,
	newStripeCardPayment,
	storedCardPayment,
} from 'calypso/lib/transaction/payments';
import { getCheckoutIncompatibleProducts } from 'calypso/state/sites/products/conflicts';
import { saveSiteSettings } from 'calypso/state/site-settings/actions';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getLocationOrigin } from 'calypso/lib/cart-values';
import isPresalesChatAvailable from 'calypso/state/happychat/selectors/is-presales-chat-available';
import getCountries from 'calypso/state/selectors/get-countries';
import {
	INPUT_VALIDATION,
	RECEIVED_WPCOM_RESPONSE,
} from 'calypso/lib/store-transactions/step-types';
import { displayError, clear } from './notices';
import { isEbanxCreditCardProcessingEnabledForCountry } from 'calypso/lib/checkout/processor-specific';
import { isWpComEcommercePlan } from 'calypso/lib/plans';
import { recordTransactionAnalytics } from 'calypso/lib/analytics/store-transactions';
import { isExternal } from 'calypso/lib/url';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:checkout:payment' );

export class SecurePaymentForm extends Component {
	static propTypes = {
		countriesList: PropTypes.array.isRequired,
		handleCheckoutCompleteRedirect: PropTypes.func.isRequired,
		handleCheckoutExternalRedirect: PropTypes.func.isRequired,
		products: PropTypes.object.isRequired,
		redirectTo: PropTypes.func.isRequired,
		isMultisite: PropTypes.bool,
	};

	state = { userSelectedPaymentBox: null };

	componentDidMount() {
		this.setInitialPaymentDetails();
	}

	async componentDidUpdate( prevProps ) {
		if ( this.getVisiblePaymentBox( prevProps ) !== this.getVisiblePaymentBox( this.props ) ) {
			this.setInitialPaymentDetails();
		}

		// From transaction-steps-mixin
		const prevStep = prevProps.transaction.step;
		const nextStep = this.props.transaction.step;

		if ( ! isEqual( prevStep, nextStep ) ) {
			await this.handleTransactionStep( this.props );
		}
	}

	setInitialPaymentDetails() {
		let newPayment;

		const visiblePaymentBox = this.getVisiblePaymentBox( this.props );

		switch ( visiblePaymentBox ) {
			case 'credits':
			case 'free-trial':
			case 'free-cart':
				// FIXME: The endpoint doesn't currently support transactions with no
				//   payment info, so for now we rely on the credits payment method for
				//   free carts.
				newPayment = fullCreditsPayment();
				break;

			case 'credit-card':
				// Set the payment information based on a stored card (if
				// available) or for a new card otherwise. But for new cards,
				// don't overwrite existing new card payment details (for
				// example, if the user already has entered information on the
				// new card form and is now switching back to it after visiting
				// another payment method).
				if ( this.getInitialCard() ) {
					newPayment = storedCardPayment( this.getInitialCard() );
				} else if ( ! get( this.props.transaction, 'payment.newCardDetails', null ) ) {
					newPayment = newStripeCardPayment();
				}
				break;

			case 'paypal':
				// We do nothing here because PayPal transactions don't go through the
				// `store-transactions` module.
				break;
		}

		if ( newPayment ) {
			// We need to defer this because this is mounted after `setDomainDetails`
			// is called.
			// Note: If this defer() is ever able to be removed, the corresponding
			// defer() in NewCardForm::handleFieldChange() can likely be removed too.
			defer( function () {
				setPayment( newPayment );
			} );
		}
	}

	getVisiblePaymentBox() {
		return null;
	}

	handlePaymentBoxSubmit = ( event ) => {
		gaRecordEvent( 'Upgrades', 'Submitted Checkout Form' );

		this.submitTransaction( event );
	};

	getInitialCard() {
		return this.props.cards[ 0 ];
	}

	selectPaymentBox = ( paymentBox ) => {
		this.setState( {
			userSelectedPaymentBox: paymentBox,
		} );
	};

	async submitTransaction( event ) {
		event && event.preventDefault();

		const { cart, transaction } = this.props;

		const origin = getLocationOrigin( window.location );
		const successPath = this.props.redirectTo();
		const successUrl = isExternal( successPath ) ? successPath : origin + successPath;
		const cancelUrl = origin + '/checkout/' + get( this.props.selectedSite, 'slug', 'no-site' );

		const cardDetailsCountry = get( transaction, 'payment.newCardDetails.country', null );
		if ( isEbanxCreditCardProcessingEnabledForCountry( cardDetailsCountry ) ) {
			transaction.payment.paymentMethod = 'WPCOM_Billing_Ebanx';
		}

		submit(
			{
				cart,
				payment: transaction.payment,
				domainDetails: transaction.domainDetails,
				successUrl,
				cancelUrl,
				stripe: transaction.stripe,
				stripeConfiguration: transaction.stripeConfiguration,
			},
			// Execute every step handler in its own event loop tick, so that a complete React
			// rendering cycle happens on each step and `componentWillReceiveProps` of objects
			// like the `TransactionStepsMixin` are called with every step.
			( step ) => defer( () => setTransactionStep( step ) )
		);
	}

	async maybeSetSiteToPublic( { cart } ) {
		const { isJetpack, siteIsPrivate } = this.props;

		if ( isJetpack || ! siteIsPrivate ) {
			return;
		}

		const productsInCart = get( cart, 'products', [] );

		if (
			! find( productsInCart, ( { product_slug = '' } ) => {
				return isWpComEcommercePlan( product_slug );
			} )
		) {
			return;
		}
	}

	async handleTransactionStep( { cart, selectedSite, transaction } ) {
		const step = transaction.step;

		debug( 'transaction step: ' + step.name );

		this.displayNotices( cart, step );
		recordTransactionAnalytics( cart, step, transaction?.payment?.paymentMethod );

		await this.finishIfLastStep( cart, selectedSite, step );
	}

	displayNotices( cart, step ) {
		if ( step.error && step.name !== INPUT_VALIDATION ) {
			displayError( step.error );
			return;
		}

		if ( step.name === RECEIVED_WPCOM_RESPONSE ) {
			clear();
		}
	}

	async finishIfLastStep( cart, selectedSite, step ) {
		if ( ! step.last || step.error ) {
			return;
		}

		try {
			await this.maybeSetSiteToPublic( { cart } );
		} catch ( e ) {
			const message = this.props.translate(
				'There was a problem completing the checkout. {{a}}Contact support{{/a}}.',
				{
					components: { a: <a href="/help/contact" /> },
					comment:
						"This is an error message that is shown when a user's purchase has failed at the checkout page",
				}
			);

			debug( 'Error setting site to public', e );
			notices.error( message );

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
	}

	renderFreeTrialConfirmationBox() {
		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step }
				infoMessage={ this.props.infoMessage }
			/>
		);
	}

	renderFreeCartPaymentBox() {
		return (
			<FreeCartPaymentBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				transactionStep={ this.props.transaction.step }
				infoMessage={ this.props.infoMessage }
			/>
		);
	}

	renderPaymentBox = ( visiblePaymentBox ) => {
		debug( 'getting %o payment box ...', visiblePaymentBox );

		switch ( visiblePaymentBox ) {
			case 'free-trial':
				return this.renderFreeTrialConfirmationBox();

			case 'free-cart':
				return this.renderFreeCartPaymentBox();

			case 'paypal':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderPayPalPaymentBox() }
					</div>
				);

			default:
				debug( 'WARN: %o payment unknown', visiblePaymentBox );
				return null;
		}
	};

	renderGreatChoiceHeader() {
		const { translate } = this.props;
		const headerText = translate( 'Great choice! How would you like to pay?' );

		this.props.setHeaderText( headerText );
	}

	render() {
		const visiblePaymentBox = this.getVisiblePaymentBox( this.props );

		if ( visiblePaymentBox === null ) {
			debug( 'empty content' );
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/error.svg"
					title={ this.props.translate( 'Checkout is not available' ) }
					line={ this.props.translate(
						"We're hard at work on the issue. Please check back shortly."
					) }
					action={ this.props.translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + this.props.selectedSite.slug }
				/>
			);
		}

		return (
			<div className="checkout__secure-payment-form">
				{ this.renderPaymentBox( visiblePaymentBox ) }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			countriesList: getCountries( state, 'payments' ),
			isJetpack: isJetpackSite( state, selectedSiteId ),
			presaleChatAvailable: isPresalesChatAvailable( state ),
			selectedSiteId,
			siteIsPrivate: isPrivateSite( state, selectedSiteId ),
			incompatibleProducts: getCheckoutIncompatibleProducts(
				state,
				selectedSiteId,
				props.cart.products
			),
		};
	},
	{ saveSiteSettings }
)( localize( SecurePaymentForm ) );
