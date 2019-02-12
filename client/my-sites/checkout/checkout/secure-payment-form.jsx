/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { get, find, defer, pick, isEqual } from 'lodash';
import { connect } from 'react-redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import CreditsPaymentBox from './credits-payment-box';
import EmergentPaywallBox from './emergent-paywall-box';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import CreditCardPaymentBox from './credit-card-payment-box';
import PayPalPaymentBox from './paypal-payment-box';
import WechatPaymentBox from './wechat-payment-box';
import RedirectPaymentBox from './redirect-payment-box';
import WebPaymentBox from './web-payment-box';
import { fullCreditsPayment, newCardPayment, storedCardPayment } from 'lib/store-transactions';
import analytics from 'lib/analytics';
import { setPayment, submitTransaction } from 'lib/upgrades/actions';
import cartValues, {
	isPaidForFullyInCredits,
	isFree,
	cartItems,
	getLocationOrigin,
} from 'lib/cart-values';
import Notice from 'components/notice';
import { preventWidows } from 'lib/formatting';
import PaymentBox from './payment-box';
import isPresalesChatAvailable from 'state/happychat/selectors/is-presales-chat-available';
import getCountries from 'state/selectors/get-countries';
import QueryPaymentCountries from 'components/data/query-countries/payments';
import { INPUT_VALIDATION, REDIRECTING_FOR_AUTHORIZATION } from 'lib/store-transactions/step-types';
import { getTld } from 'lib/domains';
import { displayError, clear } from 'lib/upgrades/notices';
import { removeNestedProperties } from 'lib/cart/store/cart-analytics';

/**
 * Module variables
 */
const { hasFreeTrial } = cartItems;
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

	componentDidUpdate( prevProps ) {
		if ( this.getVisiblePaymentBox( prevProps ) !== this.getVisiblePaymentBox( this.props ) ) {
			this.setInitialPaymentDetails();
		}

		// From transaction-steps-mixin
		const prevStep = prevProps.transaction.step,
			nextStep = this.props.transaction.step;

		if ( ! isEqual( prevStep, nextStep ) ) {
			this.handleTransactionStep( this.props );
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
				newPayment = fullCreditsPayment;
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
					newPayment = newCardPayment();
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
			if ( cartValues.isPaymentMethodEnabled( cart, get( paymentMethods, [ i ] ) ) ) {
				return paymentMethods[ i ];
			}
		}

		return null;
	}

	handlePaymentBoxSubmit = event => {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Checkout Form' );

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

	submitTransaction( event ) {
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
	}

	handleTransactionStep( { cart, selectedSite, transaction } ) {
		const step = transaction.step;

		debug( 'transaction step: ' + step.name );

		this.displayNotices( cart, step );
		this.recordAnalytics( step );

		this.finishIfLastStep( cart, selectedSite, step );
	}

	displayNotices( cart, step ) {
		if ( step.error ) {
			step.name !== INPUT_VALIDATION && displayError( step.error );
			return;
		}

		switch ( step.name ) {
			case 'received-wpcom-response':
				clear();
				break;
		}
	}

	recordAnalytics( step ) {
		const cartValue = this.props.cart;

		switch ( step.name ) {
			case 'input-validation':
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', {
						error_code: step.error.error,
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
						error_code: step.error.error,
						reason: this.formatError( step.error ),
					} );

					this.recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: false,
					} );
				} else if ( step.data ) {
					// Makes sure free trials are not recorded as purchases in ad trackers since they are products with
					// zero-value cost and would thus lead to a wrong computation of conversions
					if ( ! hasFreeTrial( cartValue ) ) {
						analytics.recordPurchase( { cart: cartValue, orderId: step.data.receipt_id } );
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

					this.recordDomainRegistrationAnalytics( {
						cart: cartValue,
						success: true,
					} );
				}
				break;

			default:
				if ( step.error ) {
					analytics.tracks.recordEvent( 'calypso_checkout_payment_error', {
						error_code: step.error.error,
						reason: this.formatError( step.error ),
					} );
				}
		}
	}

	recordDomainRegistrationAnalytics( parameters ) {
		const cart = parameters.cart,
			success = parameters.success;

		cartItems.getDomainRegistrations( cart ).forEach( function( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_domain_registration', {
				domain_name: cartItem.meta,
				domain_tld: getTld( cartItem.meta ),
				success: success,
			} );
		} );
	}

	finishIfLastStep( cart, selectedSite, step ) {
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
	}

	formatError( error ) {
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

	renderEmergentPaywallBox() {
		return (
			<PaymentBox
				classSet="emergent-payments-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="emergent-paywall"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<EmergentPaywallBox
					cart={ this.props.cart }
					selectedSite={ this.props.selectedSite }
					transaction={ this.props.transaction }
				>
					{ this.props.children }
				</EmergentPaywallBox>
			</PaymentBox>
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
					transaction={ this.props.transaction }
					transactionStep={ this.props.transaction.step }
					countriesList={ this.props.countriesList }
					onSubmit={ this.handlePaymentBoxSubmit }
					translate={ this.props.translate }
				>
					{ this.props.children }
				</WebPaymentBox>
			</PaymentBox>
		);
	}

	renderGetDotBlogNotice() {
		const hasProductFromGetDotBlogSignup = find(
			this.props.cart.products,
			product => product.extra && product.extra.source === 'get-dot-blog-signup'
		);

		if (
			this.getVisiblePaymentBox( this.props ) !== 'credit-card' ||
			! hasProductFromGetDotBlogSignup
		) {
			return;
		}

		return (
			<Notice icon="notice" showDismiss={ false }>
				{ preventWidows(
					this.props.translate(
						'You can reuse the payment information you entered on get.blog, ' +
							'a WordPress.com service. Confirm your order below.'
					),
					4
				) }
			</Notice>
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
						{ this.renderCreditCardPaymentBox() }
					</div>
				);

			case 'paypal':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderPayPalPaymentBox() }
					</div>
				);
			case 'emergent-paywall':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderEmergentPaywallBox() }
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
			case 'ideal':
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
		const formatHeaderClass = 'formatted-header',
			formatHeaderTitleClass = 'formatted-header__title';

		return (
			<header className={ formatHeaderClass }>
				<h1 className={ formatHeaderTitleClass }>
					{ this.props.translate( 'Great choice! How would you like to pay?' ) }
				</h1>
			</header>
		);
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
				{ this.renderGetDotBlogNotice() }
				{ this.renderPaymentBox( visiblePaymentBox ) }
			</div>
		);
	}
}

export default connect(
	state => {
		return {
			countriesList: getCountries( state, 'payments' ),
			presaleChatAvailable: isPresalesChatAvailable( state ),
		};
	},
	null
)( localize( SecurePaymentForm ) );
