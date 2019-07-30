/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import { isEmpty, noop } from 'lodash';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from 'react-stripe-elements';

/**
 * Internal dependencies
 */
import CreditCardNumberInput from 'components/upgrades/credit-card-number-input';
import PaymentCountrySelect from 'components/payment-country-select';
import CountrySpecificPaymentFields from 'my-sites/checkout/checkout/country-specific-payment-fields';
import { Input } from 'my-sites/domains/components/form';
import InfoPopover from 'components/info-popover';
import { maskField, unmaskField, getCreditCardType } from 'lib/checkout';
import { shouldRenderAdditionalCountryFields } from 'lib/checkout/processor-specific';
import FormInputValidation from 'components/forms/form-input-validation';

const CardNumberElementWithValidation = withStripeElementValidation( CardNumberElement );
const CardExpiryElementWithValidation = withStripeElementValidation( CardExpiryElement );
const CardCvcElementWithValidation = withStripeElementValidation( CardCvcElement );

/**
 * Style dependencies
 */
import './style.scss';

function CvvPopover( { translate, card } ) {
	const brand = getCreditCardType( card.number );

	let popoverText = translate(
		'This is the 3-digit number printed on the signature panel on the back of your card.'
	);
	let popoverImage = '/calypso/images/upgrades/cc-cvv-back.svg';

	if ( brand === 'amex' ) {
		popoverText = translate(
			'This is the 4-digit number printed above the account number ' + 'on the front of your card.'
		);
		popoverImage = '/calypso/images/upgrades/cc-cvv-front.svg';
	}

	return (
		<InfoPopover position="top" className="credit-card-form-fields__cvv-info">
			<img
				className="credit-card-form-fields__cvv-illustration"
				src={ popoverImage }
				width="42"
				height="30"
				alt={ translate( 'Credit card Security Code illustration' ) }
			/>
			{ popoverText }
		</InfoPopover>
	);
}

CvvPopover.propTypes = {
	translate: PropTypes.func.isRequired,
	card: PropTypes.object.isRequired,
};

function withStripeElementValidation( ElementComponent ) {
	return ( { getErrorMessage, fieldName, ...props } ) => {
		const [ errorMessage, setErrorMessage ] = useState();
		const onChange = ( { error } ) => setErrorMessage( error ? error.message : null );
		return (
			<React.Fragment>
				<ElementComponent onChange={ onChange } { ...props } />
				<StripeElementErrors
					errorMessage={ errorMessage }
					getErrorMessage={ getErrorMessage }
					fieldName={ fieldName }
				/>
			</React.Fragment>
		);
	};
}

function StripeElementErrors( { errorMessage, getErrorMessage, fieldName } ) {
	// If `errorMessage` is set, it will be displayed; otherwise the
	// `getErrorMessage` function will be called for the `fieldName` to determine
	// the error message.
	if ( ! errorMessage ) {
		const errorMessages = getErrorMessage( fieldName ) || [];
		errorMessage = errorMessages.length ? errorMessages[ 0 ] : null;
	}
	if ( ! errorMessage ) {
		return null;
	}
	const id = `validation-field-${ fieldName }`;
	return <FormInputValidation id={ id } isError text={ errorMessage } />;
}

StripeElementErrors.propTypes = {
	errorMessage: PropTypes.string,
	getErrorMessage: PropTypes.func.isRequired,
	fieldName: PropTypes.string.isRequired,
};

function CreditCardNumberField( { translate, stripe, createField, getErrorMessage } ) {
	const cardNumberLabel = translate( 'Card Number', {
		comment: 'Card number label on credit card form',
	} );

	if ( stripe ) {
		const elementClasses = {
			base: 'credit-card-form-fields__element',
			invalid: 'is-error',
			focus: 'has-focus',
		};
		return (
			<div className="credit-card-form-fields__field number">
				<label className="credit-card-form-fields__label form-label">
					{ cardNumberLabel }
					<CardNumberElementWithValidation
						fieldName="card_number"
						getErrorMessage={ getErrorMessage }
						classes={ elementClasses }
					/>
				</label>
			</div>
		);
	}

	return createField( 'number', CreditCardNumberInput, {
		inputMode: 'numeric',
		label: cardNumberLabel,
		placeholder: '•••• •••• •••• ••••',
	} );
}

CreditCardNumberField.propTypes = {
	translate: PropTypes.func.isRequired,
	createField: PropTypes.func.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	stripe: PropTypes.object,
};

function CreditCardExpiryAndCvvFields( { translate, stripe, createField, getErrorMessage, card } ) {
	const cvcLabel = translate( 'Security Code {{span}}("CVC" or "CVV"){{/span}}', {
		components: {
			span: <span className="credit-card-form-fields__explainer" />,
		},
	} );

	const expiryLabel = translate( 'Expiry Date', {
		comment: 'Expiry label on credit card form',
	} );

	if ( stripe ) {
		const elementClasses = {
			base: 'credit-card-form-fields__element',
			invalid: 'is-error',
			focus: 'has-focus',
		};

		return (
			<React.Fragment>
				<div className="credit-card-form-fields__field expiration-date">
					<label className="credit-card-form-fields__label form-label">
						{ expiryLabel }
						<CardExpiryElementWithValidation
							fieldName="card_expiry"
							getErrorMessage={ getErrorMessage }
							classes={ elementClasses }
						/>
					</label>
				</div>
				<div className="credit-card-form-fields__field cvv">
					<label className="credit-card-form-fields__label form-label">
						{ cvcLabel }
						<CardCvcElementWithValidation
							fieldName="card_cvc"
							getErrorMessage={ getErrorMessage }
							classes={ elementClasses }
						/>
					</label>
				</div>
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			{ createField( 'expiration-date', Input, {
				inputMode: 'numeric',
				label: expiryLabel,
				placeholder: translate( 'MM/YY', {
					comment: 'Expiry placeholder for Expiry date on credit card form',
				} ),
			} ) }

			{ createField( 'cvv', Input, {
				inputMode: 'numeric',
				placeholder: ' ',
				label: translate( 'Security Code {{span}}("CVC" or "CVV"){{/span}} {{infoPopover/}}', {
					components: {
						infoPopover: <CvvPopover translate={ translate } card={ card } />,
						span: <span className="credit-card-form-fields__explainer" />,
					},
				} ),
			} ) }
		</React.Fragment>
	);
}

CreditCardExpiryAndCvvFields.propTypes = {
	translate: PropTypes.func.isRequired,
	createField: PropTypes.func.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	card: PropTypes.object.isRequired,
	stripe: PropTypes.object,
};

export class CreditCardFormFields extends React.Component {
	static propTypes = {
		card: PropTypes.object.isRequired,
		countriesList: PropTypes.array.isRequired,
		eventFormName: PropTypes.string,
		onFieldChange: PropTypes.func,
		getErrorMessage: PropTypes.func,
		autoFocus: PropTypes.bool,
		isNewTransaction: PropTypes.bool,
		stripe: PropTypes.object,
	};

	static defaultProps = {
		eventFormName: 'Credit card input',
		onFieldChange: noop,
		getErrorMessage: noop,
		autoFocus: true,
		isNewTransaction: false,
	};

	createField = ( fieldName, componentClass, props ) => {
		const errorMessage = this.props.getErrorMessage( fieldName ) || [];
		return React.createElement(
			componentClass,
			Object.assign(
				{},
				{
					additionalClasses: 'credit-card-form-fields__field',
					eventFormName: this.props.eventFormName,
					isError: ! isEmpty( errorMessage ),
					errorMessage: errorMessage[ 0 ],
					name: fieldName,
					onBlur: this.handleFieldChange,
					onChange: this.handleFieldChange,
					value: this.getFieldValue( fieldName ),
					autoComplete: 'off',
				},
				props
			)
		);
	};

	getFieldValue = fieldName => this.props.card[ fieldName ] || '';

	updateFieldValues = ( fieldName, nextValue ) => {
		const previousValue = this.getFieldValue( fieldName );

		if ( previousValue === nextValue ) {
			return;
		}

		const { onFieldChange } = this.props;

		const rawDetails = {
			[ fieldName ]: unmaskField( fieldName, previousValue, nextValue ),
		};

		const maskedDetails = {
			[ fieldName ]: maskField( fieldName, previousValue, nextValue ),
		};

		if ( fieldName === 'number' ) {
			rawDetails.brand = getCreditCardType( rawDetails[ fieldName ] );
		}

		onFieldChange( rawDetails, maskedDetails );
	};

	handleFieldChange = event => {
		this.updateFieldValues( event.target.name, event.target.value );
	};

	shouldRenderCountrySpecificFields() {
		// The add/update card endpoints do not process Ebanx payment details
		// so we only show Ebanx fields at checkout,
		// i.e., when there is a current transaction.
		return (
			this.props.isNewTransaction &&
			shouldRenderAdditionalCountryFields( this.getFieldValue( 'country' ) )
		);
	}

	render() {
		const { translate, countriesList, autoFocus } = this.props;
		const countryDetailsRequired = this.shouldRenderCountrySpecificFields();
		const creditCardFormFieldsExtrasClassNames = classNames( {
			'credit-card-form-fields__extras': true,
			'ebanx-details-required': countryDetailsRequired,
		} );

		return (
			<div className="credit-card-form-fields">
				{ this.createField( 'name', Input, {
					autoFocus,
					label: translate( 'Cardholder Name {{span}}(as written on card){{/span}}', {
						comment: 'Cardholder name label on credit card form',
						components: {
							span: <span className="credit-card-form-fields__explainer" />,
						},
					} ),
					placeholder: ' ',
				} ) }
				<div className="credit-card-form-fields__field number">
					<CreditCardNumberField
						translate={ this.props.translate }
						stripe={ this.props.stripe }
						createField={ this.createField }
						getErrorMessage={ this.props.getErrorMessage }
					/>
				</div>

				<div className={ creditCardFormFieldsExtrasClassNames }>
					<CreditCardExpiryAndCvvFields
						translate={ this.props.translate }
						stripe={ this.props.stripe }
						createField={ this.createField }
						getErrorMessage={ this.props.getErrorMessage }
						card={ this.props.card }
					/>
					{ this.createField( 'country', PaymentCountrySelect, {
						label: translate( 'Country' ),
						placeholder: ' ',
						countriesList,
						onChange: noop,
						onCountrySelected: this.updateFieldValues,
					} ) }

					{ countryDetailsRequired ? (
						<CountrySpecificPaymentFields
							countryCode={ this.getFieldValue( 'country' ) }
							countriesList={ countriesList }
							getErrorMessage={ this.props.getErrorMessage }
							getFieldValue={ this.getFieldValue }
							handleFieldChange={ this.updateFieldValues }
						/>
					) : (
						this.createField( 'postal-code', Input, {
							label: translate( 'Postal Code', {
								comment: 'Postal code on credit card form',
							} ),
							placeholder: ' ',
						} )
					) }
				</div>
			</div>
		);
	}
}

export default localize( CreditCardFormFields );
