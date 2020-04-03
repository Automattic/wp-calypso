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
import { abtest } from 'lib/abtest';
import notices from 'notices';
import EmptyContent from 'components/empty-content';
import CreditsPaymentBox from './credits-payment-box';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import { CreditCardPaymentBox } from './credit-card-payment-box';
import PayPalPaymentBox from './paypal-payment-box';
import StripeElementsPaymentBox from './stripe-elements-payment-box';
import WechatPaymentBox from './wechat-payment-box';
import RedirectPaymentBox from './redirect-payment-box';
import WebPaymentBox from './web-payment-box';
import { submit } from 'lib/store-transactions';
import { gaRecordEvent } from 'lib/analytics/ga';
import { setPayment, setTransactionStep } from 'lib/transaction/actions';
import {
	fullCreditsPayment,
	newStripeCardPayment,
	storedCardPayment,
} from 'lib/transaction/payments';
import { saveSiteSettings } from 'state/site-settings/actions';
import getSelectedSiteId from 'state/ui/selectors/get-selected-site-id';
import isPrivateSite from 'state/selectors/is-private-site';
import { isJetpackSite } from 'state/sites/selectors';
import {
	isPaidForFullyInCredits,
	isFree,
	getLocationOrigin,
	isPaymentMethodEnabled,
} from 'lib/cart-values';
import { hasFreeTrial } from 'lib/cart-values/cart-items';
import PaymentBox from './payment-box';
import isPresalesChatAvailable from 'state/happychat/selectors/is-presales-chat-available';
import getCountries from 'state/selectors/get-countries';
import QueryPaymentCountries from 'components/data/query-countries/payments';
import { INPUT_VALIDATION, RECEIVED_WPCOM_RESPONSE } from 'lib/store-transactions/step-types';
import { displayError, clear } from './notices';
import { isEbanxCreditCardProcessingEnabledForCountry } from 'lib/checkout/processor-specific';
import { isWpComEcommercePlan } from 'lib/plans';
import { recordTransactionAnalytics } from 'lib/analytics/store-transactions';

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
		const prevStep = prevProps.transaction.step,
			nextStep = this.props.transaction.step;

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
			defer( function() {
				setPayment( newPayment );
			} );
		}
	}

	getVisiblePaymentBox( { cart, paymentMethods } ) {
		let i;

		if ( isPaidForFullyInCredits( cart ) ) {
			return 'credits';
		} else if ( isFree( cart ) ) {
			return 'free-cart';
		} else if ( hasFreeTrial( cart ) ) {
			return 'free-trial';
		} else if ( this.state && this.state.userSelectedPaymentBox ) {
			return this.state.userSelectedPaymentBox;
		}

		for ( i = 0; i < paymentMethods.length; i++ ) {
			if ( isPaymentMethodEnabled( cart, get( paymentMethods, [ i ] ) ) ) {
				return paymentMethods[ i ];
			}
		}

		return null;
	}

	handlePaymentBoxSubmit = event => {
		gaRecordEvent( 'Upgrades', 'Submitted Checkout Form' );

		this.submitTransaction( event );
	};

	getInitialCard() {
		return this.props.cards[ 0 ];
	}

	selectPaymentBox = paymentBox => {
		this.setState( {
			userSelectedPaymentBox: paymentBox,
		} );
	};

	async submitTransaction( event ) {
		event && event.preventDefault();

		const { cart, transaction } = this.props;

		const origin = getLocationOrigin( window.location );
		const successUrl = origin + this.props.redirectTo();
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
			step => defer( () => setTransactionStep( step ) )
		);
	}

	async maybeSetSiteToPublic( { cart } ) {
		const { isJetpack, selectedSiteId, siteIsPrivate } = this.props;

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

		if ( 'variant' !== abtest( 'ATPrivacy' ) ) {
			// Until Atomic sites support being private / unlaunched, set them to public on upgrade
			debug( 'Setting site to public because it is an Atomic plan' );
			const response = await this.props.saveSiteSettings( selectedSiteId, {
				blog_public: 1,
			} );

			if ( ! get( response, [ 'updated', 'blog_public' ] ) ) {
				throw 'Invalid response';
			}
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

	renderCreditsPaymentBox() {
		return (
			<CreditsPaymentBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step }
				presaleChatAvailable={ this.props.presaleChatAvailable }
			>
				{ this.props.children }
			</CreditsPaymentBox>
		);
	}

	renderFreeTrialConfirmationBox() {
		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step }
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
			/>
		);
	}

	renderCreditCardPaymentBox() {
		return (
			<PaymentBox
				classSet="credit-card-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="credit-card"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<QueryPaymentCountries />
				<CreditCardPaymentBox
					translate={ this.props.translate }
					cards={ this.props.cards }
					transaction={ this.props.transaction }
					cart={ this.props.cart }
					countriesList={ this.props.countriesList }
					initialCard={ this.getInitialCard() }
					selectedSite={ this.props.selectedSite }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</CreditCardPaymentBox>
			</PaymentBox>
		);
	}

	renderStripeElementsPaymentBox() {
		return (
			<PaymentBox
				classSet="credit-card-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="credit-card"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<QueryPaymentCountries />
				<StripeElementsPaymentBox
					translate={ this.props.translate }
					cards={ this.props.cards }
					transaction={ this.props.transaction }
					cart={ this.props.cart }
					countriesList={ this.props.countriesList }
					initialCard={ this.getInitialCard() }
					selectedSite={ this.props.selectedSite }
					onSubmit={ this.handlePaymentBoxSubmit }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</StripeElementsPaymentBox>
			</PaymentBox>
		);
	}

	renderPayPalPaymentBox() {
		return (
			<PaymentBox
				classSet="paypal-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="paypal"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<QueryPaymentCountries />
				<PayPalPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					countriesList={ this.props.countriesList }
					selectedSite={ this.props.selectedSite }
					redirectTo={ this.props.redirectTo }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</PayPalPaymentBox>
			</PaymentBox>
		);
	}

	renderRedirectPaymentBox( paymentType ) {
		return (
			<PaymentBox
				classSet="redirect-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod={ paymentType }
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<QueryPaymentCountries />
				<RedirectPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					countriesList={ this.props.countriesList }
					selectedSite={ this.props.selectedSite }
					paymentType={ paymentType }
					redirectTo={ this.props.redirectTo }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</RedirectPaymentBox>
			</PaymentBox>
		);
	}

	renderWechatPaymentBox() {
		return (
			<PaymentBox
				classSet="wechat-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod={ 'wechat' }
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<QueryPaymentCountries />
				<WechatPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					selectedSite={ this.props.selectedSite }
					redirectTo={ this.props.redirectTo }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</WechatPaymentBox>
			</PaymentBox>
		);
	}

	renderWebPaymentBox() {
		return (
			<PaymentBox
				classSet="web-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="web-payment"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<WebPaymentBox
					cart={ this.props.cart }
					countriesList={ this.props.countriesList }
					onSubmit={ this.handlePaymentBoxSubmit }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				>
					{ this.props.children }
				</WebPaymentBox>
			</PaymentBox>
		);
	}

	renderPaymentBox = visiblePaymentBox => {
		debug( 'getting %o payment box ...', visiblePaymentBox );

		switch ( visiblePaymentBox ) {
			case 'credits':
				return this.renderCreditsPaymentBox();

			case 'free-trial':
				return this.renderFreeTrialConfirmationBox();

			case 'free-cart':
				return this.renderFreeCartPaymentBox();

			case 'credit-card':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderStripeElementsPaymentBox() }
					</div>
				);

			case 'paypal':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderPayPalPaymentBox() }
					</div>
				);
			case 'wechat':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderWechatPaymentBox() }
					</div>
				);
			case 'alipay':
			case 'bancontact':
			case 'eps':
			case 'giropay':
			case 'id_wallet':
			case 'ideal':
			case 'netbanking':
			case 'p24':
			case 'brazil-tef':
			case 'sofort':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderRedirectPaymentBox( visiblePaymentBox ) }
					</div>
				);
			case 'web-payment':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderWebPaymentBox() }
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
	state => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			countriesList: getCountries( state, 'payments' ),
			isJetpack: isJetpackSite( state, selectedSiteId ),
			presaleChatAvailable: isPresalesChatAvailable( state ),
			selectedSiteId,
			siteIsPrivate: isPrivateSite( state, selectedSiteId ),
		};
	},
	{ saveSiteSettings }
)( localize( SecurePaymentForm ) );
