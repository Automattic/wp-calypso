/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { noop, overSome, some } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import PayButton from './pay-button';
import CreditCardSelector from './credit-card-selector';
import {
	BEFORE_SUBMIT,
	INPUT_VALIDATION,
	RECEIVED_PAYMENT_KEY_RESPONSE,
	RECEIVED_WPCOM_RESPONSE,
	REDIRECTING_FOR_AUTHORIZATION,
	MODAL_AUTHORIZATION,
	RECEIVED_AUTHORIZATION_RESPONSE,
	SUBMITTING_PAYMENT_KEY_REQUEST,
	SUBMITTING_WPCOM_REQUEST,
} from 'lib/store-transactions/step-types';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import { ProgressBar } from '@automattic/components';
import CartToggle from './cart-toggle';
import RecentRenewals from './recent-renewals';
import CheckoutTerms from './checkout-terms';
import { withStripeProps } from 'lib/stripe';
import { setStripeObject } from 'lib/transaction/actions';

function isFormSubmitting( transactionStep ) {
	if ( ! transactionStep ) {
		return false;
	}
	switch ( transactionStep.name ) {
		case BEFORE_SUBMIT:
			return false;

		case INPUT_VALIDATION:
			if ( transactionStep.error ) {
				return false;
			}
			return true;

		case RECEIVED_PAYMENT_KEY_RESPONSE:
		case RECEIVED_AUTHORIZATION_RESPONSE:
			if ( transactionStep.error ) {
				return false;
			}
			return true;

		case SUBMITTING_PAYMENT_KEY_REQUEST:
		case SUBMITTING_WPCOM_REQUEST:
		case REDIRECTING_FOR_AUTHORIZATION:
		case MODAL_AUTHORIZATION:
			return true;

		case RECEIVED_WPCOM_RESPONSE:
			if ( transactionStep.error || ! transactionStep.data.success ) {
				return false;
			}
			return true;

		default:
			return false;
	}
}

class CreditCardPaymentBox extends React.Component {
	static propTypes = {
		cart: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		transactionStep: PropTypes.object.isRequired,
		cards: PropTypes.array,
		countriesList: PropTypes.array.isRequired,
		initialCard: PropTypes.object,
		onSubmit: PropTypes.func,
		translate: PropTypes.func.isRequired,
		stripe: PropTypes.object,
		isStripeLoading: PropTypes.bool,
		stripeLoadingError: PropTypes.object,
		stripeConfiguration: PropTypes.object,
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

	componentDidUpdate( prevProps ) {
		if (
			! isFormSubmitting( prevProps.transactionStep ) &&
			isFormSubmitting( this.props.transactionStep )
		) {
			this.timer = setInterval( this.tick, 100 );
		}

		if ( this.props.transactionStep.error ) {
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
				overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
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

	submit = ( event ) => {
		event.preventDefault();

		if ( this.props.stripe ) {
			setStripeObject( this.props.stripe, this.props.stripeConfiguration );
		}

		this.setState( {
			progress: 0,
		} );

		// setStripeObject uses Flux Dispatcher so they are deferred. This
		// defers the submit so it will occur after they take effect.
		setTimeout( () => this.props.onSubmit(), 0 );
	};

	render = () => {
		const {
			cart,
			cards,
			countriesList,
			initialCard,
			transaction,
			stripe,
			isStripeLoading,
			stripeLoadingError,
			translate,
		} = this.props;

		return (
			<React.Fragment>
				<form autoComplete="off" onSubmit={ this.submit }>
					<CreditCardSelector
						cards={ cards }
						countriesList={ countriesList }
						initialCard={ initialCard }
						transaction={ transaction }
						stripe={ stripe }
						isStripeLoading={ isStripeLoading }
						stripeLoadingError={ stripeLoadingError }
						translate={ translate }
					/>

					{ this.props.children }

					<RecentRenewals cart={ cart } />

					<CheckoutTerms cart={ cart } />

					<div className="checkout__payment-box-actions">
						{ isFormSubmitting( this.props.transactionStep )
							? this.progressBar()
							: this.paymentButtons() }
					</div>
				</form>
				<CartCoupon cart={ cart } />
				<CartToggle />
			</React.Fragment>
		);
	};
}

export { CreditCardPaymentBox };

const InjectedStripeCreditCardPaymentBox = withStripeProps( CreditCardPaymentBox );
export default InjectedStripeCreditCardPaymentBox;
