/**
 * External dependencies
 */
import React, { useState } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { CardCvcElement, CardExpiryElement, CardNumberElement } from 'react-stripe-elements';
import { isEmpty, noop } from 'lodash';
import { localize, useTranslate } from 'i18n-calypso';
import { useStripe, withStripeProps } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import PaymentCountrySelect from 'calypso/components/payment-country-select';
import { Input } from 'calypso/my-sites/domains/components/form';
import { maskField, unmaskField, getCreditCardType } from 'calypso/lib/checkout';

const CardNumberElementWithValidation = withStripeElementValidation( CardNumberElement );
const CardExpiryElementWithValidation = withStripeElementValidation( CardExpiryElement );
const CardCvcElementWithValidation = withStripeElementValidation( CardCvcElement );

/**
 * Style dependencies
 */
import './style.scss';
import { customProperties } from '@automattic/calypso-color-schemes/js';

function withStripeElementValidation( ElementComponent ) {
	return ( { getErrorMessage, fieldName, ...props } ) => {
		const [ errorMessage, setErrorMessage ] = useState();
		const onChange = ( { error } ) => setErrorMessage( error ? error.message : null );
		const stripeFieldStyles = {
			base: {
				fontSize: '16px',
				color: customProperties[ '--studio-gray-70' ],
				fontFamily:
					'-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen-Sans", "Ubuntu", "Cantarell", "Helvetica Neue", sans-serif',
			},
			invalid: {
				color: customProperties[ '--studio-red-50' ],
			},
		};

		return (
			<React.Fragment>
				<ElementComponent onChange={ onChange } style={ stripeFieldStyles } { ...props } />
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

function CreditCardNumberField( { translate, getErrorMessage } ) {
	const cardNumberLabel = translate( 'Card number', {
		comment: 'Card number label on credit card form',
	} );

	const elementClasses = {
		base: 'credit-card-form-fields__element',
		invalid: 'is-error',
		focus: 'has-focus',
	};

	return (
		<div className="credit-card-form-fields__field number">
			<FormLabel className="credit-card-form-fields__label">
				{ cardNumberLabel }
				<CardNumberElementWithValidation
					fieldName="card_number"
					getErrorMessage={ getErrorMessage }
					classes={ elementClasses }
				/>
			</FormLabel>
		</div>
	);
}

CreditCardNumberField.propTypes = {
	translate: PropTypes.func.isRequired,
	createField: PropTypes.func.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	card: PropTypes.object.isRequired,
};

function CreditCardExpiryAndCvvFields( { translate, getErrorMessage } ) {
	const cvcLabel = translate( 'Security code' );

	const expiryLabel = translate( 'Expiry date' );

	const elementClasses = {
		base: 'credit-card-form-fields__element',
		invalid: 'is-error',
		focus: 'has-focus',
	};

	return (
		<React.Fragment>
			<div className="credit-card-form-fields__field expiration-date">
				<FormLabel className="credit-card-form-fields__label">
					{ expiryLabel }
					<CardExpiryElementWithValidation
						fieldName="card_expiry"
						getErrorMessage={ getErrorMessage }
						classes={ elementClasses }
					/>
				</FormLabel>
			</div>
			<div className="credit-card-form-fields__cvv-wrapper">
				<div className="credit-card-form-fields__field cvv">
					<FormLabel className="credit-card-form-fields__label">
						{ cvcLabel }
						<CardCvcElementWithValidation
							fieldName="card_cvc"
							getErrorMessage={ getErrorMessage }
							classes={ elementClasses }
						/>
					</FormLabel>
					<CvvCard />
				</div>
			</div>
		</React.Fragment>
	);
}

CreditCardExpiryAndCvvFields.propTypes = {
	translate: PropTypes.func.isRequired,
	createField: PropTypes.func.isRequired,
	getErrorMessage: PropTypes.func.isRequired,
	card: PropTypes.object.isRequired,
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
	};

	static defaultProps = {
		eventFormName: 'Credit card input',
		onFieldChange: noop,
		getErrorMessage: noop,
		autoFocus: false,
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

	getFieldValue = ( fieldName ) => this.props.card[ fieldName ] || '';

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

	handleFieldChange = ( event ) => {
		this.updateFieldValues( event.target.name, event.target.value );
	};

	render() {
		const { translate, countriesList, autoFocus, isStripeLoading, stripeLoadingError } = this.props;
		const creditCardFormFieldsExtrasClassNames = classNames( {
			'credit-card-form-fields__extras': true,
		} );

		const disabled = isFieldDisabled( {
			isStripeLoading,
			stripeLoadingError,
		} );

		/* eslint-disable jsx-a11y/no-autofocus */
		return (
			<div className="credit-card-form-fields">
				<CardholderNameField
					autoFocus={ autoFocus }
					createField={ this.createField }
					shouldRenderCountrySpecificFields={ false }
				/>
				<div className="credit-card-form-fields__field number">
					<CreditCardNumberField
						translate={ this.props.translate }
						createField={ this.createField }
						getErrorMessage={ this.props.getErrorMessage }
						card={ this.props.card }
					/>
				</div>

				<div className={ creditCardFormFieldsExtrasClassNames }>
					<CreditCardExpiryAndCvvFields
						translate={ this.props.translate }
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
						disabled,
					} ) }

					{ this.createField( 'postal-code', Input, {
						label: translate( 'Postal code' ),
						placeholder: ' ',
						disabled,
					} ) }
				</div>
			</div>
		);
	}
}

function CardholderNameField( { createField, autoFocus } ) {
	const translate = useTranslate();
	const { isStripeLoading, stripeLoadingError } = useStripe();

	const disabled = isFieldDisabled( {
		isStripeLoading,
		stripeLoadingError,
	} );

	return (
		<>
			{ createField( 'name', Input, {
				disabled,
				autoFocus,
				label: translate( 'Cardholder name' ),
				placeholder: ' ',
				description: translate( "Enter your name as it's written on the card" ),
			} ) }
		</>
	);
}

function isFieldDisabled( { isStripeLoading, stripeLoadingError } ) {
	const isStripeNotReady = isStripeLoading || stripeLoadingError;
	return isStripeNotReady;
}

function CvvCard( { className = '' } ) {
	const translate = useTranslate();
	return (
		<svg
			className={ 'credit-card-form-fields__cvv-illustration ' + className }
			viewBox="0 0 68 41"
			preserveAspectRatio="xMaxYMin meet"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-labelledby="cvv-image-title"
			role="img"
			focusable="false"
			width="68"
			height="41"
		>
			<title id="cvv-image-title">
				{ translate( 'An image of the back of the card where you find the security code' ) }
			</title>
			<rect x="0" y="0" width="67.0794" height="45" rx="3" fill="#D7DADE" />
			<rect x="0" y="4" width="67.0794" height="10.4828" fill="#23282D" />
			<rect x="6.84361" y="21.3398" width="35.087" height="8.63682" fill="white" />
			<path
				d="M49.8528 23.2869C50.2903 23.2869 50.6262 23.4753 50.8606 23.8523C51.0969 24.2273 51.2151 24.7546 51.2151 25.4343C51.2151 26.0925 51.1008 26.615 50.8723 27.0017C50.6438 27.3865 50.3039 27.5789 49.8528 27.5789C49.4172 27.5789 49.0813 27.3914 48.845 27.0164C48.6086 26.6414 48.4905 26.114 48.4905 25.4343C48.4905 24.7742 48.6047 24.2517 48.8332 23.8669C49.0637 23.4802 49.4036 23.2869 49.8528 23.2869ZM49.8528 27.157C50.1418 27.157 50.3557 27.0203 50.4944 26.7468C50.635 26.4714 50.7053 26.0339 50.7053 25.4343C50.7053 24.8328 50.635 24.3962 50.4944 24.1248C50.3557 23.8513 50.1418 23.7146 49.8528 23.7146C49.5676 23.7146 49.3547 23.8542 49.2141 24.1335C49.0735 24.4128 49.0032 24.8464 49.0032 25.4343C49.0032 26.03 49.0725 26.4666 49.2112 26.7439C49.3518 27.0193 49.5657 27.157 49.8528 27.157ZM49.8411 24.9949C49.9641 24.9949 50.0676 25.0378 50.1516 25.1238C50.2375 25.2078 50.2805 25.3113 50.2805 25.4343C50.2805 25.5613 50.2375 25.6707 50.1516 25.7625C50.0657 25.8523 49.9622 25.8972 49.8411 25.8972C49.7219 25.8972 49.6194 25.8523 49.5334 25.7625C49.4495 25.6707 49.4075 25.5613 49.4075 25.4343C49.4075 25.3093 49.4485 25.2048 49.5305 25.1208C49.6145 25.0369 49.718 24.9949 49.8411 24.9949ZM54.5373 27.4998H52.2639V27.1511C52.8401 26.5085 53.2141 26.0779 53.386 25.8591C53.5579 25.6404 53.6975 25.4109 53.8049 25.1707C53.9123 24.9304 53.9661 24.6912 53.9661 24.4529C53.9661 24.2224 53.8957 24.0408 53.7551 23.908C53.6164 23.7751 53.4211 23.7087 53.1692 23.7087C52.9758 23.7087 52.7161 23.7683 52.3899 23.8875L52.3225 23.4744C52.6174 23.3494 52.926 23.2869 53.2483 23.2869C53.6174 23.2869 53.9143 23.3914 54.1389 23.6003C54.3655 23.8074 54.4788 24.0847 54.4788 24.4324C54.4788 24.6804 54.4202 24.9265 54.303 25.1707C54.1877 25.4148 54.0393 25.6492 53.8577 25.8738C53.676 26.0984 53.3225 26.5007 52.7971 27.0808H54.5373V27.4998ZM57.3235 25.2791C57.5754 25.3494 57.7776 25.4783 57.9299 25.6658C58.0823 25.8513 58.1584 26.0603 58.1584 26.2927C58.1584 26.656 58.0168 26.9617 57.7336 27.2097C57.4504 27.4558 57.1164 27.5789 56.7317 27.5789C56.4036 27.5789 56.1096 27.5066 55.8498 27.3621L55.9436 26.9666C56.2151 27.0935 56.4836 27.157 56.7493 27.157C56.9993 27.157 57.2122 27.0798 57.3879 26.9255C57.5657 26.7693 57.6545 26.5691 57.6545 26.325C57.6545 26.0847 57.5598 25.8894 57.3704 25.739C57.1809 25.5886 56.9299 25.5134 56.6174 25.5134H56.4914V25.1179H56.5266C56.8274 25.1179 57.0754 25.0476 57.2707 24.907C57.4661 24.7644 57.5637 24.573 57.5637 24.3328C57.5637 24.1375 57.4934 23.9851 57.3528 23.8757C57.2122 23.7644 57.0188 23.7087 56.7727 23.7087C56.5598 23.7087 56.3215 23.7664 56.0579 23.8816L55.9934 23.4685C56.259 23.3474 56.5266 23.2869 56.7961 23.2869C57.1653 23.2869 57.469 23.3845 57.7073 23.5798C57.9475 23.7732 58.0676 24.0222 58.0676 24.3269C58.0676 24.5378 57.9944 24.7351 57.8479 24.9187C57.7034 25.1003 57.5286 25.2146 57.3235 25.2615V25.2791Z"
				fill="black"
			/>
			<rect x="44.7258" y="18.9998" width="17.4205" height="13.3329" stroke="#C9356E" />
		</svg>
	);
}

export default withStripeProps( localize( CreditCardFormFields ) );
