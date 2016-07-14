/**
 * External dependencies
 */
var defer = require( 'lodash/defer' ),
	React = require( 'react' );

/**
 * Internal dependencies
 */
var CreditCardPaymentBox = require( './credit-card-payment-box' ),
	EmptyContent = require( 'components/empty-content' ),
	FreeTrialConfirmationBox = require( './free-trial-confirmation-box' ),
	PayPalPaymentBox = require( './paypal-payment-box' ),
	CreditsPaymentBox = require( './credits-payment-box' ),
	FreeCartPaymentBox = require( './free-cart-payment-box' ),
	PaymentBox = require( './payment-box.jsx' ),
	storeTransactions = require( 'lib/store-transactions' ),
	cartValues = require( 'lib/cart-values' ),
	isPaidForFullyInCredits = cartValues.isPaidForFullyInCredits,
	isFree = cartValues.isFree,
	hasFreeTrial = cartValues.cartItems.hasFreeTrial,
	countriesList = require( 'lib/countries-list' ).forPayments(),
	analytics = require( 'lib/analytics' ),
	TransactionStepsMixin = require( './transaction-steps-mixin' ),
	upgradesActions = require( 'lib/upgrades/actions' );

var SecurePaymentForm = React.createClass( {
	mixins: [ TransactionStepsMixin ],

	propTypes: {
		products: React.PropTypes.object.isRequired,
		redirectTo: React.PropTypes.func.isRequired
	},

	getInitialState: function() {
		var cart = this.props.cart;

		return {
			userSelectedPaymentBox: null,
			visiblePaymentBox: this.getVisiblePaymentBox( cart ),
			previousCart: null
		};
	},

	getVisiblePaymentBox: function( cart ) {
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
		} else {
			return null;
		}
	},

	componentWillReceiveProps: function( nextProps ) {
		if ( nextProps.transaction.step.name !== 'before-submit' ) {
			return;
		}
		var newCart = nextProps.cart;

		this.setState( {
			visiblePaymentBox: this.getVisiblePaymentBox( newCart )
		} );
	},

	handlePaymentBoxSubmit: function( event ) {
		analytics.ga.recordEvent( 'Upgrades', 'Submitted Checkout Form' );

		// `submitTransaction` comes from the `TransactionStepsMixin`
		this.submitTransaction( event );
	},

	render: function() {
		if ( this.state.visiblePaymentBox === null ) {
			return (
				<EmptyContent
					illustration='/calypso/images/drake/drake-500.svg'
					title={ this.translate( 'Checkout is not available' ) }
					line={ this.translate( "We're hard at work on the issue. Please check back shortly." ) }
					action={ this.translate( 'Back to Plans' ) }
					actionURL={ '/plans/' + this.props.selectedSite.slug } />
			);
		}

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
					countriesList={ countriesList }
					initialCard={ this.getInitialCard() }
					selected={ this.state.visiblePaymentBox === 'credit-card' }
					selectedSite={ this.props.selectedSite }
					onToggle={ this.selectPaymentBox }
					onSubmit={ this.handlePaymentBoxSubmit }
					transactionStep={ this.props.transaction.step } />

				<PayPalPaymentBox
					cart={ this.props.cart }
					transaction={ this.props.transaction }
					countriesList={ countriesList }
					selected={ this.state.visiblePaymentBox === 'paypal' }
					selectedSite={ this.props.selectedSite }
					onToggle={ this.selectPaymentBox }
					redirectTo={ this.props.redirectTo } />

			</div>
		);
	},

	getInitialCard: function() {
		return this.props.cards[ 0 ];
	},

	componentWillMount: function() {
		this.setInitialPaymentDetails();
	},

	componentDidUpdate: function( prevProps, prevState ) {
		if ( this.state.visiblePaymentBox !== prevState.visiblePaymentBox ) {
			this.setInitialPaymentDetails();
		}
	},

	setInitialPaymentDetails: function() {
		var newPayment;

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

	selectPaymentBox: function( paymentBox ) {
		this.setState( {
			userSelectedPaymentBox: paymentBox,
			visiblePaymentBox: paymentBox
		} );
	}
} );

SecurePaymentForm.Placeholder = React.createClass( {
	displayName: 'SecurePaymentForm.Placeholder',

	render: function() {
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

module.exports = SecurePaymentForm;
