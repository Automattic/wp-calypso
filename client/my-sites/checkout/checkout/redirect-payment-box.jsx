/** @format */

/**
 * External dependencies
 */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { snakeCase, some, map, zipObject, isEmpty, mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import { localize, translate } from 'i18n-calypso';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import CartToggle from './cart-toggle';
import TermsOfService from './terms-of-service';
import { Input, Select } from 'my-sites/domains/components/form';
import cartValues, {
	paymentMethodName,
	paymentMethodClassName,
	getLocationOrigin,
} from 'lib/cart-values';
import SubscriptionText from './subscription-text';
import analytics from 'lib/analytics';
import wpcom from 'lib/wp';
import notices from 'notices';
import EbanxPaymentFields from 'my-sites/checkout/checkout/ebanx-payment-fields';
import { planMatches } from 'lib/plans';
import { TYPE_BUSINESS, GROUP_WPCOM } from 'lib/plans/constants';
import { validatePaymentDetails, maskField, unmaskField } from 'lib/checkout';
import { PAYMENT_PROCESSOR_EBANX_COUNTRIES } from 'lib/checkout/constants';

export class RedirectPaymentBox extends PureComponent {
	static displayName = 'RedirectPaymentBox';

	static propTypes = {
		paymentType: PropTypes.string.isRequired,
		cart: PropTypes.object.isRequired,
		countriesList: PropTypes.object.isRequired,
		transaction: PropTypes.object.isRequired,
		redirectTo: PropTypes.func.isRequired,
	};

	eventFormName = 'Checkout Form';

	constructor( props ) {
		super( props );
		this.state = {
			errorMessages: [],
			paymentDetails: this.setPaymentDetailsState( props.paymentType ),
		};
	}

	setPaymentDetailsState( paymentType ) {
		let paymentDetailsState = {};
		switch ( paymentType ) {
			case 'tef':
				paymentDetailsState = {
					'tef-bank': '',
					...zipObject(
						PAYMENT_PROCESSOR_EBANX_COUNTRIES.BR.fields,
						map( PAYMENT_PROCESSOR_EBANX_COUNTRIES.BR.fields, () => '' )
					),
				};
		}
		return {
			name: '',
			...paymentDetailsState,
		};
	}

	handleChange = event => this.updateFieldValues( event.target.name, event.target.value );

	getErrorMessage = fieldName => this.state.errorMessages[ fieldName ];

	getFieldValue = fieldName => this.state.paymentDetails[ fieldName ];

	updateFieldValues = ( name, value ) => {
		this.setState( {
			paymentDetails: {
				...this.state.paymentDetails,
				[ name ]: maskField( name, this.state.paymentDetails[ name ], value ),
			},
		} );
	};

	createField = ( fieldName, componentClass, props ) => {
		const errorMessage = this.getErrorMessage( fieldName ) || [];
		return React.createElement(
			componentClass,
			Object.assign(
				{},
				{
					additionalClasses: 'checkout__checkout-field',
					eventFormName: this.props.eventFormName,
					isError: ! isEmpty( errorMessage ),
					errorMessage: errorMessage[ 0 ],
					name: fieldName,
					onBlur: this.handleChange,
					onChange: this.handleChange,
					value: this.getFieldValue( fieldName ),
					autoComplete: 'off',
				},
				props
			)
		);
	};

	setSubmitState( submitState ) {
		if ( submitState.error ) {
			notices.error( submitState.error );
		}
		if ( submitState.info ) {
			notices.info( submitState.info );
		}

		this.setState( {
			formDisabled: submitState.disabled,
		} );
	}

	paymentMethodByType( paymentType ) {
		return paymentMethodClassName( paymentType ) || 'WPCOM_Billing_Stripe_Source';
	}

	redirectToPayment = event => {
		const origin = getLocationOrigin( location );
		event.preventDefault();

		const validation = validatePaymentDetails( this.state.paymentDetails, this.props.paymentType );

		this.setState( {
			errorMessages: validation.errors,
		} );

		if ( ! isEmpty( validation.errors ) ) {
			return;
		}

		this.setSubmitState( {
			info: translate( 'Setting up your %(paymentProvider)s payment', {
				args: { paymentProvider: this.getPaymentProviderName() },
			} ),
			disabled: true,
		} );

		let cancelUrl = origin + '/checkout/';

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
		} else {
			cancelUrl += 'no-site';
		}

		// unmask form values
		const paymentDetails = mapValues( this.state.paymentDetails, ( value, key ) =>
			unmaskField( key, null, value )
		);

		const dataForApi = {
			payment: Object.assign( {}, paymentDetails, {
				paymentMethod: this.paymentMethodByType( this.props.paymentType ),
				successUrl: origin + this.props.redirectTo(),
				cancelUrl,
			} ),
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails,
		};

		// get the redirect URL from rest endpoint
		wpcom.undocumented().transactions( 'POST', dataForApi, ( error, result ) => {
			let errorMessage;
			if ( error ) {
				if ( error.message ) {
					errorMessage = error.message;
				} else {
					errorMessage = translate( "We've encountered a problem. Please try again later." );
				}

				this.setSubmitState( {
					error: errorMessage,
					disabled: false,
				} );
			} else if ( result.redirect_url ) {
				this.setSubmitState( {
					info: translate( 'Redirecting you to the payment partner to complete the payment.' ),
					disabled: true,
				} );
				analytics.ga.recordEvent( 'Upgrades', 'Clicked Checkout With Redirect Payment Button' );
				analytics.tracks.recordEvent(
					'calypso_checkout_with_redirect_' + snakeCase( this.props.paymentType )
				);
				location.href = result.redirect_url;
			}
		} );
	};

	renderButtonText() {
		if ( cartValues.cartItems.hasRenewalItem( this.props.cart ) ) {
			return translate( 'Purchase %(price)s subscription with %(paymentProvider)s', {
				args: {
					price: this.props.cart.total_cost_display,
					paymentProvider: this.getPaymentProviderName(),
				},
			} );
		}

		return translate( 'Pay %(price)s with %(paymentProvider)s', {
			args: {
				price: this.props.cart.total_cost_display,
				paymentProvider: this.getPaymentProviderName(),
			},
		} );
	}

	getBankOptions( paymentType ) {
		// Source https://stripe.com/docs/sources/ideal
		const banks = {
			ideal: [
				{ value: 'abn_amro', label: 'ABN AMRO' },
				{ value: 'asn_bank', label: 'ASN Bank' },
				{ value: 'bunq', label: 'Bunq' },
				{ value: 'ing', label: 'ING' },
				{ value: 'knab', label: 'Knab' },
				{ value: 'rabobank', label: 'Rabobank' },
				{ value: 'regiobank', label: 'RegioBank' },
				{ value: 'sns_bank', label: 'SNS Bank' },
				{ value: 'triodos_bank', label: 'Triodos Bank' },
				{ value: 'van_lanschot', label: 'Van Lanschot' },
			],
			tef: [
				{ value: 'banrisul', label: 'Banrisul' },
				{ value: 'bradesco', label: 'Bradesco' },
				{ value: 'bancodobrasil', label: 'Banco do Brasil' },
				{ value: 'itau', label: 'Itaú' },
			],
		};
		return [
			{ value: '', label: translate( 'Please select your bank.' ) },
			...banks[ paymentType ],
		];
	}

	renderAdditionalFields() {
		switch ( this.props.paymentType ) {
			case 'ideal':
				return this.createField( 'ideal-bank', Select, {
					label: translate( 'Bank' ),
					options: this.getBankOptions( 'ideal' ),
				} );
			case 'p24':
				return this.createField( 'email', Input, {
					label: translate( 'Email Address' ),
				} );
			case 'tef':
				return (
					<Fragment>
						{ this.createField( 'tef-bank', Select, {
							label: translate( 'Bank' ),
							options: this.getBankOptions( 'tef' ),
						} ) }
						<EbanxPaymentFields
							countryCode="BR"
							countriesList={ this.props.countriesList }
							getErrorMessage={ this.getErrorMessage }
							getFieldValue={ this.getFieldValue }
							handleFieldChange={ this.updateFieldValues }
							eventFormName={ this.eventFormName }
						/>
					</Fragment>
				);
		}
	}

	render() {
		const hasBusinessPlanInCart = some( this.props.cart.products, ( { product_slug } ) =>
			planMatches( product_slug, {
				type: TYPE_BUSINESS,
				group: GROUP_WPCOM,
			} )
		);
		const showPaymentChatButton = this.props.presaleChatAvailable && hasBusinessPlanInCart;

		return (
			<form onSubmit={ this.redirectToPayment }>
				<div className="checkout__payment-box-section">
					{ this.createField( 'name', Input, {
						label: translate( 'Your Name' ),
					} ) }
					{ this.renderAdditionalFields() }
				</div>

				{ this.props.children }

				<TermsOfService
					hasRenewableSubscription={ cartValues.cartItems.hasRenewableSubscription(
						this.props.cart
					) }
				/>

				<div className="checkout__payment-box-actions">
					<div className="checkout__pay-button">
						<button type="submit" className="checkout__button-pay button is-primary ">
							{ this.renderButtonText() }
						</button>
						<SubscriptionText cart={ this.props.cart } />
					</div>

					{ showPaymentChatButton && (
						<PaymentChatButton paymentType={ this.props.paymentType } cart={ this.props.cart } />
					) }
				</div>

				<CartCoupon cart={ this.props.cart } />

				<CartToggle />
			</form>
		);
	}

	getPaymentProviderName() {
		return paymentMethodName( this.props.paymentType );
	}
}

export default localize( RedirectPaymentBox );
