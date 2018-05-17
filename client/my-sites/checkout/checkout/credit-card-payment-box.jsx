/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, some } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import CreditCardSelector from './credit-card-selector';
import TermsOfService from './terms-of-service';
import cartValues, { areInstallmentsAvailable } from 'lib/cart-values';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	REDIRECTING_FOR_AUTHORIZATION,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { getPlan, planMatches } from 'lib/plans';
import { GROUP_WPCOM, TYPE_BUSINESS } from 'lib/plans/constants';
import ProgressBar from 'components/progress-bar';
import CartToggle from './cart-toggle';
import InstallmentsPlanPicker from 'blocks/installments-plan-picker';
import { applyInstallments } from 'lib/upgrades/actions';
import { isEbanxCreditCardProcessingEnabledForCountry } from 'lib/checkout/ebanx';

export class CreditCardPaymentBox extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		transactionStep: PropTypes.object.isRequired,
		cards: PropTypes.array,
		countriesList: PropTypes.array.isRequired,
		initialCard: PropTypes.object,
		onSubmit: PropTypes.func,
	};

	static defaultProps = {
		cards: [],
		initialCard: null,
		onSubmit: noop,
	};

	constructor( props ) {
		super( props );
		this.state = {
			progress: 0,
			previousCart: null,
		};
		this.timer = null;
	}

	componentWillReceiveProps( nextProps ) {
		if (
			! this.submitting( this.props.transactionStep ) &&
			this.submitting( nextProps.transactionStep )
		) {
			this.timer = setInterval( this.tick, 100 );
		}

		if ( nextProps.transactionStep.error ) {
			this.clearTickInterval();
		}
	}

	componentWillUnmount() {
		this.clearTickInterval();
	}

	clearTickInterval() {
		clearInterval( this.timer );
		this.timer = null;
	}

	tick = () => {
		// increase the progress of the progress bar by 0.5% of the remaining progress each tick
		const progress = this.state.progress + ( 1 / 200 ) * ( 100 - this.state.progress );

		this.setState( { progress } );
	};

	submitting = transactionStep => {
		switch ( transactionStep.name ) {
			case BEFORE_SUBMIT:
				return false;

			case INPUT_VALIDATION:
				if ( transactionStep.error ) {
					return false;
				}
				return true;

			case RECEIVED_PAYMENT_KEY_RESPONSE:
				if ( this.props.transactionStep.error ) {
					return false;
				}
				return true;

			case SUBMITTING_PAYMENT_KEY_REQUEST:
			case SUBMITTING_WPCOM_REQUEST:
			case REDIRECTING_FOR_AUTHORIZATION:
				return true;

			case RECEIVED_WPCOM_RESPONSE:
				if ( transactionStep.error || ! transactionStep.data.success ) {
					return false;
				}
				return true;

			default:
				return false;
		}
	};

	progressBar = () => {
		return (
			<div className="checkout__credit-card-payment-box-progress-bar">
				{ this.props.translate( 'Processing payment…' ) }
				<ProgressBar value={ Math.round( this.state.progress ) } isPulsing />
			</div>
		);
	};

	paymentButtons = () => {
		const { cart, transactionStep, translate, presaleChatAvailable } = this.props,
			hasBusinessPlanInCart = some( cart.products, ( { product_slug } ) =>
				planMatches( product_slug, {
					type: TYPE_BUSINESS,
					group: GROUP_WPCOM,
				} )
			),
			showPaymentChatButton = presaleChatAvailable && hasBusinessPlanInCart,
			paymentButtonClasses = 'payment-box__payment-buttons';

		return (
			<div className={ paymentButtonClasses }>
				<PayButton cart={ cart } transactionStep={ transactionStep } />

				<div className="checkout__secure-payment">
					<div className="checkout__secure-payment-content">
						<Gridicon icon="lock" />
						{ translate( 'Secure Payment' ) }
					</div>
				</div>

				{ showPaymentChatButton && (
					<PaymentChatButton
						paymentType="credits"
						cart={ cart }
						transactionStep={ transactionStep }
					/>
				) }
			</div>
		);
	};

	paymentBoxActions = () => {
		let content = this.paymentButtons();
		if ( this.props.transactionStep && this.submitting( this.props.transactionStep ) ) {
			content = this.progressBar();
		}

		return <div className="checkout__payment-box-actions">{ content }</div>;
	};

	submit = event => {
		event.preventDefault();
		this.setState( {
			progress: 0,
		} );
		this.props.onSubmit( event );
	};

	getPlanProducts() {
		return this.props.cart.products
			? this.props.cart.products.filter( ( { product_slug } ) => getPlan( product_slug ) )
			: false;
	}

	shouldRenderInstallmentsPlanPicker() {
		const { cart, transaction } = this.props;

		if ( typeof transaction.payment === 'undefined' ) {
			return false;
		}

		const planInCart = this.getPlanProducts()[ 0 ];
		if ( ! planInCart ) {
			return false;
		}

		if ( ! areInstallmentsAvailable( cart ) ) {
			return false;
		}

		const isEbanxStoredCard =
			typeof transaction.payment.storedCard !== 'undefined' &&
			transaction.payment.storedCard.payment_partner === 'ebanx';

		return (
			isEbanxStoredCard ||
			// 'WPCOM_Billing_MoneyPress_Paygate' is the default paymentMethod for new CC payments, even for ebanx
			( transaction.payment.paymentMethod === 'WPCOM_Billing_MoneyPress_Paygate' &&
				isEbanxCreditCardProcessingEnabledForCountry( transaction.newCardFormFields.country ) )
		);
	}

	renderInstallmentsPlanPicker() {
		if ( ! this.shouldRenderInstallmentsPlanPicker() ) {
			return false;
		}

		return (
			<React.Fragment>
				<InstallmentsPlanPicker
					plans={ this.props.cart.installments_plans }
					initialValue={ this.props.cart.installments ? this.props.cart.installments : 1 }
					onChange={ applyInstallments }
					key="installments-plan-picker"
				/>
				<hr className="checkout__installments-plan-picker-separator" key="separator" />
			</React.Fragment>
		);
	}

	render = () => {
		const { cart, cards, countriesList, initialCard, transaction } = this.props;

		return (
			<React.Fragment>
				<form autoComplete="off" onSubmit={ this.submit }>
					<CreditCardSelector
						cards={ cards }
						countriesList={ countriesList }
						initialCard={ initialCard }
						transaction={ transaction }
					/>

					{ this.props.children }
					{ this.renderInstallmentsPlanPicker() }
					<TermsOfService
						hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription( cart ) }
					/>

					{ this.paymentBoxActions() }
				</form>
				<CartCoupon cart={ cart } />
				<CartToggle />
			</React.Fragment>
		);
	};
}

export default localize( CreditCardPaymentBox );
