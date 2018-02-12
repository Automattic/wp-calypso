/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';
import createReactClass from 'create-react-class';
import { get, find, defer } from 'lodash';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import CreditsPaymentBox from './credits-payment-box';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import CreditCardPaymentBox from './credit-card-payment-box';
import PayPalPaymentBox from './paypal-payment-box';
import SourcePaymentBox from './source-payment-box';
import { fullCreditsPayment, newCardPayment, storedCardPayment } from 'lib/store-transactions';
import analytics from 'lib/analytics';
import TransactionStepsMixin from './transaction-steps-mixin';
import { setPayment } from 'lib/upgrades/actions';
import { forPayments as countriesListForPayments } from 'lib/countries-list';
import debugFactory from 'debug';
import cartValues, { isPaidForFullyInCredits, isFree, cartItems } from 'lib/cart-values';
import Notice from 'components/notice';
import { preventWidows } from 'lib/formatting';
import PaymentBox from './payment-box';
import isPresalesChatAvailable from 'state/happychat/selectors/is-presales-chat-available';

/**
 * Module variables
 */
const { hasFreeTrial } = cartItems;
const debug = debugFactory( 'calypso:checkout:payment' );

const SecurePaymentForm = createReactClass( {
	displayName: 'SecurePaymentForm',
	mixins: [ TransactionStepsMixin ],

	propTypes: {
		handleCheckoutCompleteRedirect: PropTypes.func.isRequired,
		products: PropTypes.object.isRequired,
		redirectTo: PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			userSelectedPaymentBox: null,
			visiblePaymentBox: this.getVisiblePaymentBox( this.props.cart, this.props.paymentMethods ),
			previousCart: null,
		};
	},

	getVisiblePaymentBox( cart, paymentMethods ) {
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
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.transaction.step.name !== 'before-submit' ) {
			return;
		}

		this.setState( {
			visiblePaymentBox: this.getVisiblePaymentBox( nextProps.cart, nextProps.paymentMethods ),
		} );
	},

	handlePaymentBoxSubmit( event ) {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Checkout Form' );

		// `submitTransaction` comes from the `TransactionStepsMixin`
		this.submitTransaction( event );
	},

	getInitialCard() {
		return this.props.cards[ 0 ];
	},

	componentWillMount() {
		this.setInitialPaymentDetails();
	},

	componentDidUpdate( prevProps, prevState ) {
		if ( this.state.visiblePaymentBox !== prevState.visiblePaymentBox ) {
			this.setInitialPaymentDetails();
		}
	},

	setInitialPaymentDetails() {
		let newPayment;

		switch ( this.state.visiblePaymentBox ) {
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
	},

	selectPaymentBox( paymentBox ) {
		this.setState( {
			userSelectedPaymentBox: paymentBox,
			visiblePaymentBox: paymentBox,
		} );
	},

	renderCreditsPaymentBox() {
		return (
			<CreditsPaymentBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step }
				presaleChatAvailable={ this.props.presaleChatAvailable }
			/>
		);
	},

	renderFreeTrialConfirmationBox() {
		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step }
			/>
		);
	},

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
	},

	renderCreditCardPaymentBox() {
		return (
			<PaymentBox
				classSet="credit-card-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="credit-card"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<CreditCardPaymentBox
					cards={ this.props.cards }
					transaction={ this.props.transaction }
					cart={ this.props.cart }
					countriesList={ countriesListForPayments }
					initialCard={ this.getInitialCard() }
					selectedSite={ this.props.selectedSite }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				/>
			</PaymentBox>
		);
	},

	renderPayPalPaymentBox() {
		return (
			<PaymentBox
				classSet="paypal-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod="paypal"
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<PayPalPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					countriesList={ countriesListForPayments }
					selectedSite={ this.props.selectedSite }
					redirectTo={ this.props.redirectTo }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				/>
			</PaymentBox>
		);
	},

	renderSourcePaymentBox( paymentType ) {
		return (
			<PaymentBox
				classSet="source-payment-box"
				cart={ this.props.cart }
				paymentMethods={ this.props.paymentMethods }
				currentPaymentMethod={ paymentType }
				onSelectPaymentMethod={ this.selectPaymentBox }
			>
				<SourcePaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					selectedSite={ this.props.selectedSite }
					paymentType={ paymentType }
					redirectTo={ this.props.redirectTo }
					presaleChatAvailable={ this.props.presaleChatAvailable }
				/>
			</PaymentBox>
		);
	},

	renderGetDotBlogNotice() {
		const hasProductFromGetDotBlogSignup = find(
			this.props.cart.products,
			product => product.extra && product.extra.source === 'get-dot-blog-signup'
		);

		if ( this.state.visiblePaymentBox !== 'credit-card' || ! hasProductFromGetDotBlogSignup ) {
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
	},

	renderPaymentBox() {
		const { visiblePaymentBox } = this.state;
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

			case 'alipay':
			case 'bancontact':
			case 'eps':
			case 'giropay':
			case 'ideal':
			case 'p24':
				return (
					<div>
						{ this.renderGreatChoiceHeader() }
						{ this.renderSourcePaymentBox( visiblePaymentBox ) }
					</div>
				);

			default:
				debug( 'WARN: %o payment unknown', visiblePaymentBox );
				return null;
		}
	},

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
	},

	render() {
		if ( this.state.visiblePaymentBox === null ) {
			return (
				<EmptyContent
					illustration="/calypso/images/illustrations/illustration-500.svg"
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
			<div className="secure-payment-form">
				{ this.renderGetDotBlogNotice() }
				{ this.renderPaymentBox() }
			</div>
		);
	},
} );

export default connect( state => {
	return {
		presaleChatAvailable: isPresalesChatAvailable( state ),
	};
}, null )( localize( SecurePaymentForm ) );
