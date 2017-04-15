/**
 * External dependencies
 */
import React from 'react';
import { get, find, defer } from 'lodash';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';

import CreditsPaymentBox from './credits-payment-box';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import CreditCardPaymentBox from './credit-card-payment-box';
import PayPalPaymentBox from './paypal-payment-box';

import storeTransactions from 'lib/store-transactions';
import analytics from 'lib/analytics';
import TransactionStepsMixin from './transaction-steps-mixin';
import upgradesActions from 'lib/upgrades/actions';
import countriesList from 'lib/countries-list';
import debugFactory from 'debug';
import cartValues, {
	isPaidForFullyInCredits,
	isFree,
	cartItems
} from 'lib/cart-values';
import Notice from 'components/notice';
import { preventWidows } from 'lib/formatting';

/**
 * Module variables
 */
const { hasFreeTrial } = cartItems;
const countriesListForPayments = countriesList.forPayments();
const debug = debugFactory( 'calypso:checkout:payment' );

const SecurePaymentForm = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	propTypes: {
		handleCheckoutCompleteRedirect: React.PropTypes.func.isRequired,
		products: React.PropTypes.object.isRequired,
		redirectTo: React.PropTypes.func.isRequired,
	},

	getInitialState() {
		return {
			userSelectedPaymentBox: null,
			visiblePaymentBox: this.getVisiblePaymentBox( this.props.cart, this.props.paymentMethods ),
			previousCart: null
		};
	},

	getVisiblePaymentBox( cart, paymentMethods ) {
		const primary = 0, secondary = 1;

		if ( isPaidForFullyInCredits( cart ) ) {
			return 'credits';
		} else if ( isFree( cart ) ) {
			return 'free-cart';
		} else if ( hasFreeTrial( cart ) ) {
			return 'free-trial';
		} else if ( this.state && this.state.userSelectedPaymentBox ) {
			return this.state.userSelectedPaymentBox;
		} else if ( cartValues.isPaymentMethodEnabled( cart, get( paymentMethods, [ primary ] ) ) ) {
			return paymentMethods[ primary ];
		} else if ( cartValues.isPaymentMethodEnabled( cart, get( paymentMethods, [ secondary ] ) ) ) {
			return paymentMethods[ secondary ];
		}

		return null;
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.transaction.step.name !== 'before-submit' ) {
			return;
		}

		this.setState( {
			visiblePaymentBox: this.getVisiblePaymentBox( nextProps.cart, nextProps.paymentMethods )
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
				newPayment = storeTransactions.fullCreditsPayment();
				break;

			case 'credit-card':
				if ( this.getInitialCard() ) {
					newPayment = storeTransactions.storedCardPayment( this.getInitialCard() );
				} else {
					newPayment = storeTransactions.newCardPayment();
				}
				break;

			case 'paypal':
				// We do nothing here because PayPal transactions don't go through the
				// `store-transactions` module.
				break;
		}

		if ( newPayment ) {
			// we need to defer this because this is mounted after `upgradesActions.setDomainDetails` is called
			defer( function() {
				upgradesActions.setPayment( newPayment );
			} );
		}
	},

	selectPaymentBox( paymentBox ) {
		this.setState( {
			userSelectedPaymentBox: paymentBox,
			visiblePaymentBox: paymentBox
		} );
	},

	renderCreditsPayentBox() {
		return (
			<CreditsPaymentBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step } />
		);
	},

	renderFreeTrialConfirmationBox() {
		return (
			<FreeTrialConfirmationBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step } />
		);
	},

	renderFreeCartPaymentBox() {
		return (
			<FreeCartPaymentBox
				cart={ this.props.cart }
				onSubmit={ this.handlePaymentBoxSubmit }
				products={ this.props.products }
				selectedSite={ this.props.selectedSite }
				transactionStep={ this.props.transaction.step } />
		);
	},

	renderCreditCardPaymentBox() {
		return (
			<CreditCardPaymentBox
				cards={ this.props.cards }
				transaction={ this.props.transaction }
				cart={ this.props.cart }
				countriesList={ countriesListForPayments }
				initialCard={ this.getInitialCard() }
				selectedSite={ this.props.selectedSite }
				onToggle={ this.selectPaymentBox }
				onSubmit={ this.handlePaymentBoxSubmit }
				transactionStep={ this.props.transaction.step } />
		);
	},

	renderPayPalPaymentBox() {
		return (
			<PayPalPaymentBox
				cart={ this.props.cart }
				transaction={ this.props.transaction }
				countriesList={ countriesListForPayments }
				selectedSite={ this.props.selectedSite }
				onToggle={ this.selectPaymentBox }
				redirectTo={ this.props.redirectTo } />
		);
	},

	renderGetDotBlogNotice() {
		const hasProductFromGetDotBlogSignup = find( this.props.cart.products, product => (
			product.extra && product.extra.source === 'get-dot-blog-signup'
		) );

		if ( this.state.visiblePaymentBox !== 'credit-card' || ! hasProductFromGetDotBlogSignup ) {
			return;
		}

		return (
			<Notice icon="notice" showDismiss={ false }>
				{ preventWidows( this.translate( 'You can reuse the payment information you entered on get.blog, ' +
					'a WordPress.com service. Confirm your order below.' ), 4 ) }
			</Notice>
		);
	},

	renderPaymentBox() {
		const { visiblePaymentBox } = this.state;
		debug( 'getting %o payment box ...', visiblePaymentBox );

		switch ( visiblePaymentBox ) {
			case 'credits':
				return this.renderCreditsPayentBox();

			case 'free-trial':
				return this.renderFreeTrialConfirmationBox();

			case 'free-cart':
				return this.renderFreeCartPaymentBox();

			case 'credit-card':
				return this.renderCreditCardPaymentBox();

			case 'paypal':
				return this.renderPayPalPaymentBox();
			default:
				debug( 'WARN: %o payment unknown', visiblePaymentBox );
				return null;
		}
	},

	render() {
		if ( this.state.visiblePaymentBox === null ) {
			return (
				<EmptyContent
					illustration="/calypso/images/drake/drake-500.svg"
					title={ this.translate( 'Checkout is not available' ) }
					line={ this.translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ this.translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + this.props.selectedSite.slug } />
			);
		}

		return (
			<div className="secure-payment-form">
				{ this.renderGetDotBlogNotice() }
				{ this.renderPaymentBox() }
			</div>
		);
	}
} );

export default SecurePaymentForm;

