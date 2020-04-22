/**
 * External dependencies
 */
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { snakeCase, map, zipObject, isEmpty, mapValues, overSome, some } from 'lodash';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';
import CartCoupon from 'my-sites/checkout/cart/cart-coupon';
import PaymentChatButton from './payment-chat-button';
import CartToggle from './cart-toggle';
import TermsOfService from './terms-of-service';
import { Input, Select } from 'my-sites/domains/components/form';
import { paymentMethodName, paymentMethodClassName, getLocationOrigin } from 'lib/cart-values';
import { hasRenewalItem, hasRenewableSubscription } from 'lib/cart-values/cart-items';
import SubscriptionText from './subscription-text';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { gaRecordEvent } from 'lib/analytics/ga';
import wpcom from 'lib/wp';
import notices from 'notices';
import CountrySpecificPaymentFields from './country-specific-payment-fields';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'lib/plans';
import { validatePaymentDetails, maskField, unmaskField } from 'lib/checkout';
import { PAYMENT_PROCESSOR_COUNTRIES_FIELDS } from 'lib/checkout/constants';
import DomainRegistrationRefundPolicy from './domain-registration-refund-policy';
import DomainRegistrationAgreement from './domain-registration-agreement';

export class RedirectPaymentBox extends PureComponent {
	static displayName = 'RedirectPaymentBox';

	static propTypes = {
		paymentType: PropTypes.string.isRequired,
		cart: PropTypes.object.isRequired,
		countriesList: PropTypes.array.isRequired,
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
			case 'brazil-tef':
				paymentDetailsState = {
					'tef-bank': '',
					...zipObject(
						PAYMENT_PROCESSOR_COUNTRIES_FIELDS.BR.fields,
						map( PAYMENT_PROCESSOR_COUNTRIES_FIELDS.BR.fields, () => '' )
					),
				};
		}
		return {
			name: '',
			...paymentDetailsState,
		};
	}

	handleChange = ( event ) => this.updateFieldValues( event.target.name, event.target.value );

	getErrorMessage = ( fieldName ) => this.state.errorMessages[ fieldName ];

	getFieldValue = ( fieldName ) => this.state.paymentDetails[ fieldName ];

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
					disabled: this.state.formDisabled,
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

	redirectToPayment = ( event ) => {
		const origin = getLocationOrigin( window.location );
		event.preventDefault();

		const validation = validatePaymentDetails( this.state.paymentDetails, this.props.paymentType );

		this.setState( {
			errorMessages: validation.errors,
		} );

		if ( ! isEmpty( validation.errors ) ) {
			return;
		}

		this.setSubmitState( {
			info: this.props.translate( 'Setting up your %(paymentProvider)s payment', {
				args: { paymentProvider: this.getPaymentProviderName() },
			} ),
			disabled: true,
		} );

		let cancelUrl = origin + '/checkout/',
			successUrl;
		const redirectTo = this.props.redirectTo();
		const redirectPath = redirectTo.includes( 'https://' ) ? redirectTo : origin + redirectTo;

		if ( this.props.selectedSite ) {
			cancelUrl += this.props.selectedSite.slug;
			successUrl =
				origin +
				`/checkout/thank-you/${ this.props.selectedSite.slug }/pending?redirectTo=${ redirectPath }`;
		} else {
			cancelUrl += 'no-site';
			successUrl = origin + `/checkout/thank-you/no-site/pending?redirectTo=${ redirectPath }`;
		}

		// unmask form values
		const paymentDetails = mapValues( this.state.paymentDetails, ( value, key ) =>
			unmaskField( key, null, value )
		);

		const dataForApi = {
			payment: Object.assign( {}, paymentDetails, {
				paymentMethod: this.paymentMethodByType( this.props.paymentType ),
				successUrl: successUrl,
				cancelUrl,
			} ),
			cart: this.props.cart,
			domainDetails: this.props.transaction.domainDetails,
		};

		// get the redirect URL from rest endpoint
		wpcom
			.undocumented()
			.transactions( dataForApi )
			.then( ( result ) => {
				if ( result.redirect_url ) {
					this.setSubmitState( {
						info: this.props.translate(
							'Redirecting you to the payment partner to complete the payment.'
						),
						disabled: true,
					} );
					gaRecordEvent( 'Upgrades', 'Clicked Checkout With Redirect Payment Button' );
					recordTracksEvent(
						'calypso_checkout_with_redirect_' + snakeCase( this.props.paymentType )
					);
					window.location.href = result.redirect_url;
				}
			} )
			.catch( ( error ) => {
				let errorMessage;
				if ( error.message ) {
					errorMessage = error.message;
				} else {
					errorMessage = this.props.translate(
						"We've encountered a problem. Please try again later."
					);
				}

				this.setSubmitState( {
					error: errorMessage,
					disabled: false,
				} );
			} );
	};

	renderButtonText() {
		if ( hasRenewalItem( this.props.cart ) ) {
			return this.props.translate( 'Purchase %(price)s subscription with %(paymentProvider)s', {
				args: {
					price: this.props.cart.total_cost_display,
					paymentProvider: this.getPaymentProviderName(),
				},
			} );
		}

		return this.props.translate( 'Pay %(price)s with %(paymentProvider)s', {
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
			'brazil-tef': [
				{ value: 'banrisul', label: 'Banrisul' },
				{ value: 'bradesco', label: 'Bradesco' },
				{ value: 'bancodobrasil', label: 'Banco do Brasil' },
				{ value: 'itau', label: 'Itaú' },
			],
		};
		return [
			{ value: '', label: this.props.translate( 'Please select your bank.' ) },
			...banks[ paymentType ],
		];
	}

	renderAdditionalFields() {
		switch ( this.props.paymentType ) {
			case 'ideal':
				return this.createField( 'ideal-bank', Select, {
					label: this.props.translate( 'Bank' ),
					options: this.getBankOptions( 'ideal' ),
				} );
			case 'p24':
				return this.createField( 'email', Input, {
					label: this.props.translate( 'Email Address' ),
				} );
			case 'id_wallet':
				return (
					<CountrySpecificPaymentFields
						countryCode="ID"
						countriesList={ this.props.countriesList }
						getErrorMessage={ this.getErrorMessage }
						getFieldValue={ this.getFieldValue }
						handleFieldChange={ this.updateFieldValues }
						eventFormName={ this.eventFormName }
						disableFields={ this.state.formDisabled }
					/>
				);
			case 'netbanking':
				return (
					<CountrySpecificPaymentFields
						countryCode="IN"
						countriesList={ this.props.countriesList }
						getErrorMessage={ this.getErrorMessage }
						getFieldValue={ this.getFieldValue }
						handleFieldChange={ this.updateFieldValues }
						eventFormName={ this.eventFormName }
						disableFields={ this.state.formDisabled }
					/>
				);
			case 'brazil-tef':
				return (
					<Fragment>
						{ this.createField( 'tef-bank', Select, {
							label: this.props.translate( 'Bank' ),
							options: this.getBankOptions( 'brazil-tef' ),
						} ) }
						<CountrySpecificPaymentFields
							countryCode="BR"
							countriesList={ this.props.countriesList }
							getErrorMessage={ this.getErrorMessage }
							getFieldValue={ this.getFieldValue }
							handleFieldChange={ this.updateFieldValues }
							eventFormName={ this.eventFormName }
							disableFields={ this.state.formDisabled }
						/>
					</Fragment>
				);
		}
	}

	render() {
		const hasBusinessPlanInCart = some( this.props.cart.products, ( { product_slug } ) =>
			overSome( isWpComBusinessPlan, isWpComEcommercePlan )( product_slug )
		);
		const showPaymentChatButton = this.props.presaleChatAvailable && hasBusinessPlanInCart;

		return (
			<React.Fragment>
				<form onSubmit={ this.redirectToPayment }>
					<div className="checkout__payment-box-section">
						{ this.createField( 'name', Input, {
							label: this.props.translate( 'Your Name' ),
						} ) }
						{ this.renderAdditionalFields() }
					</div>

					{ this.props.children }

					<TermsOfService
						hasRenewableSubscription={ hasRenewableSubscription( this.props.cart ) }
					/>
					<DomainRegistrationRefundPolicy cart={ this.props.cart } />
					<DomainRegistrationAgreement cart={ this.props.cart } />

					<div className="checkout__payment-box-actions">
						<div className="checkout__payment-box-buttons">
							<span className="checkout__pay-button">
								<button
									type="submit"
									className="checkout__pay-button-button button is-primary "
									disabled={ this.state.formDisabled }
								>
									{ this.renderButtonText() }
								</button>
								<SubscriptionText cart={ this.props.cart } />
							</span>

							<div className="checkout__secure-payment">
								<div className="checkout__secure-payment-content">
									<Gridicon icon="lock" />
									{ this.props.translate( 'Secure Payment' ) }
								</div>
							</div>

							{ showPaymentChatButton && (
								<PaymentChatButton
									paymentType={ this.props.paymentType }
									cart={ this.props.cart }
								/>
							) }
						</div>
					</div>
				</form>
				<CartCoupon cart={ this.props.cart } />
				<CartToggle />
			</React.Fragment>
		);
	}

	getPaymentProviderName() {
		return paymentMethodName( this.props.paymentType );
	}
}

export default localize( RedirectPaymentBox );
