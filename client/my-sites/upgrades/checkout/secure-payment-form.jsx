/**
 * External dependencies
 */
import React from 'react';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import CreditCardPaymentBox from './credit-card-payment-box';
import EmptyContent from 'components/empty-content';
import FreeTrialConfirmationBox from './free-trial-confirmation-box';
import PayPalPaymentBox from './paypal-payment-box';
import CreditsPaymentBox from './credits-payment-box';
import FreeCartPaymentBox from './free-cart-payment-box';
import PaymentBox from './payment-box.jsx';
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

/**
 * Module variables
 */
const { hasFreeTrial } = cartItems;
const countriesListForPayments = countriesList.forPayments();
const debug = debugFactory( 'calypso:checkout:payment' );

const SecurePaymentForm = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	propTypes: {
		products: React.PropTypes.object.isRequired,
		redirectTo: React.PropTypes.func.isRequired
	},

	getInitialState() {
		return {
			userSelectedPaymentBox: null,
			visiblePaymentBox: this.getVisiblePaymentBox( this.props.cart ),
			previousCart: null
		};
	},

	getVisiblePaymentBox( cart ) {
		if ( isPaidForFullyInCredits( cart ) ) {
			return 'credits';
		} else if ( isFree( cart ) ) {
			return 'free-cart';
		} else if ( hasFreeTrial( cart ) ) {
			return 'free-trial';
		} else if ( this.state && this.state.userSelectedPaymentBox ) {
			return this.state.userSelectedPaymentBox;
		} else if ( cartValues.isCreditCardPaymentsEnabled( cart ) ) {
			return 'credit-card';
		} else if ( cartValues.isPayPalExpressEnabled( cart ) ) {
			return 'paypal';
		}

		return null;
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.transaction.step.name !== 'before-submit' ) {
			return;
		}

		this.setState( {
			visiblePaymentBox: this.getVisiblePaymentBox( nextProps.cart )
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
		debug( 'showing %o payment box ...', this.state.visiblePaymentBox );

		return (
			<div className="secure-payment-form">
				<CreditsPaymentBox
					cart={ this.props.cart }
					selected={ this.state.visiblePaymentBox === 'credits' }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step } />

				<FreeTrialConfirmationBox
					cart={ this.props.cart }
					selected={ this.state.visiblePaymentBox === 'free-trial' }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step } />

				<FreeCartPaymentBox
					cart={ this.props.cart }
					selected={ this.state.visiblePaymentBox === 'free-cart' }
					onSubmit={ this.handlePaymentBoxSubmit }
					products={ this.props.products }
					selectedSite={ this.props.selectedSite }
					transactionStep={ this.props.transaction.step } />

				<CreditCardPaymentBox
					cards={ this.props.cards }
					transaction={ this.props.transaction }
					cart={ this.props.cart }
					countriesList={ countriesListForPayments }
					initialCard={ this.getInitialCard() }
					selected={ this.state.visiblePaymentBox === 'credit-card' }
					selectedSite={ this.props.selectedSite }
					onToggle={ this.selectPaymentBox }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step } />

				<PayPalPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					countriesList={ countriesListForPayments }
					selected={ this.state.visiblePaymentBox === 'paypal' }
					selectedSite={ this.props.selectedSite }
					onToggle={ this.selectPaymentBox }
					redirectTo={ this.props.redirectTo } />

			</div>
		);
	}
} );

SecurePaymentForm.Placeholder = React.createClass( {
	displayName: 'SecurePaymentForm.Placeholder',

	render() {
		return (
			<PaymentBox
				classSet="selected is-empty"
				contentClassSet="selected is-empty" >
				<div className="payment-box-section">

					<div className="placeholder-row placeholder"/>
					<div className="placeholder-row placeholder"/>
					<div className="placeholder-col-narrow placeholder-inline-pad">
						<div className="placeholder" />
					</div>
					<div className="placeholder-col-narrow placeholder-inline-pad-only-wide">
						<div className="placeholder" />
					</div>
					<div className="placeholder-col-wide">
						<div className="placeholder" />
					</div>
					<div className="placeholder-row placeholder"/>
				</div>
				<div className="payment-box-hr" />
				<div className="placeholder-button-container">
					<div className="placeholder-col-narrow">
						<div className="placeholder placeholder-button"></div>
					</div>
				</div>
			</PaymentBox>
		);
	}
} );

export default SecurePaymentForm;
