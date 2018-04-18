/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { reduxForm, Field, Fields, getFormValues, isValid, isDirty } from 'redux-form';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import emailValidator from 'email-validator';
import { flowRight as compose, omit, padEnd, trimEnd, get } from 'lodash';

/**
 * Internal dependencies
 */
import ExternalLink from 'components/external-link';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormCurrencyInput from 'components/forms/form-currency-input';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ReduxFormFieldset, { FieldsetRenderer } from 'components/redux-forms/redux-form-fieldset';
import UploadImage from 'blocks/upload-image';
import { getCurrencyDefaults } from 'lib/format-currency';
import config from 'config';

const REDUX_FORM_NAME = 'simplePaymentsForm';

// Export some selectors that are needed by the code that submits the form
export const getProductFormValues = state => getFormValues( REDUX_FORM_NAME )( state );
export const isProductFormValid = state => isValid( REDUX_FORM_NAME )( state );
export const isProductFormDirty = state => isDirty( REDUX_FORM_NAME )( state );

// https://developer.paypal.com/docs/integration/direct/rest/currency-codes/
const SUPPORTED_CURRENCY_LIST = [
	'USD',
	'EUR',
	'AUD',
	'BRL',
	'CAD',
	'CZK',
	'DKK',
	'HKD',
	'HUF',
	'ILS',
	'JPY',
	'MYR',
	'MXN',
	'TWD',
	'NZD',
	'NOK',
	'PHP',
	'PLN',
	'GBP',
	'RUB',
	'SGD',
	'SEK',
	'CHF',
	'THB',
];

const VISUAL_CURRENCY_LIST = SUPPORTED_CURRENCY_LIST.map( code => {
	const { symbol } = getCurrencyDefaults( code );
	// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
	// trim the dot at the end, e.g., 'kr.' becomes 'kr'
	const label = symbol === code ? code : `${ code } ${ trimEnd( symbol, '.' ) }`;
	return { code, label };
} );

// based on https://stackoverflow.com/a/10454560/59752
function decimalPlaces( number ) {
	const match = ( '' + number ).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
	if ( ! match ) {
		return 0;
	}
	return Math.max( 0, ( match[ 1 ] ? match[ 1 ].length : 0 ) - ( match[ 2 ] ? +match[ 2 ] : 0 ) );
}

// Validation function for the form
const validate = ( values, props ) => {
	// The translate function was passed as a prop to the `reduxForm()` wrapped component
	const { translate } = props;
	const { precision } = getCurrencyDefaults( values.currency );
	const errors = {};

	if ( ! values.title ) {
		errors.title = translate(
			"People need to know what they're paying for! Please add a brief title."
		);
	}

	if ( ! values.price || parseFloat( values.price ) === 0 ) {
		errors.price = translate( 'Everything comes with a price tag these days. Add yours here.' );
	} else if ( parseFloat( values.price ) === NaN ) {
		errors.price = translate( 'Invalid price' );
	} else if ( parseFloat( values.price ) < 0 ) {
		errors.price = translate( "Your price is negative — now that doesn't sound right, does it?" );
	} else if ( decimalPlaces( values.price ) > precision ) {
		if ( precision === 0 ) {
			errors.price = translate(
				"We know every penny counts, but prices can't contain decimal values."
			);
		} else {
			const countDecimal = translate(
				'%(precision)d decimal place',
				'%(precision)d decimal places',
				{
					count: precision,
					args: {
						precision,
					},
				}
			);
			errors.price = translate( 'Price cannot have more than %(countDecimal)s.', {
				args: { countDecimal },
			} );
		}
	}

	if ( ! values.email ) {
		errors.email = translate(
			'We want to make sure payments reach you, so please add an email address.'
		);
	} else if ( ! emailValidator.validate( values.email ) ) {
		errors.email = translate( '%(email)s is not a valid email address.', {
			args: { email: values.email },
		} );
	}

	if ( values.featuredImageId && values.featuredImageId === 'uploading' ) {
		errors.featuredImageId = 'uploading';
	}

	return errors;
};

// The 'price' input displays data from two fields: `price` and `currency`. That's why we
// render it using the `Fields` component instead of `Field`. We need this rendering wrapper
// to transform the props from `{ price: { input, meta }, currency: { input, meta } }` that
// `Fields` is receiving to `{ input, meta }` that `Field` expects.
const renderPriceField = ( { price, currency, ...props } ) => {
	const { precision } = getCurrencyDefaults( currency.input.value );
	// Tune the placeholder to the precision value: 0 -> '1', 1 -> '1.0', 2 -> '1.00'
	const placeholder = precision > 0 ? padEnd( '1.', precision + 2, '0' ) : '1';
	return (
		<FieldsetRenderer
			inputComponent={ FormCurrencyInput }
			{ ...price }
			{ ...omit( props, [ 'names' ] ) }
			currencySymbolPrefix={ currency.input.value }
			onCurrencyChange={ currency.input.onChange }
			currencyList={ VISUAL_CURRENCY_LIST }
			placeholder={ placeholder }
		/>
	);
};

// helper to render UploadImage as a form field
class UploadImageField extends Component {
	handleImageEditorDone = () => this.props.input.onChange( 'uploading' );
	handleImageUploadDone = uploadedImage => this.props.input.onChange( uploadedImage.ID );
	handleImageRemove = () => this.props.input.onChange( null );

	render() {
		return (
			<UploadImage
				defaultImage={ this.props.input.value }
				onImageEditorDone={ this.handleImageEditorDone }
				onImageUploadDone={ this.handleImageUploadDone }
				onImageRemove={ this.handleImageRemove }
				onError={ this.props.onError }
			/>
		);
	}
}

class ProductForm extends Component {
	handleUploadImageError = ( errorCode, errorMessage ) => this.props.showError( errorMessage );

	render() {
		const { translate } = this.props;

		return (
			<form className="editor-simple-payments-modal__form">
				<Field
					name="featuredImageId"
					onError={ this.handleUploadImageError }
					component={ UploadImageField }
				/>
				<div className="editor-simple-payments-modal__form-fields">
					<ReduxFormFieldset
						name="title"
						label={ translate( 'What is this payment for?' ) }
						component={ FormTextInput }
						explanation={ translate(
							'For example: event tickets, charitable donations, training courses, coaching fees, etc.'
						) }
					/>
					<ReduxFormFieldset
						name="description"
						label={ translate( 'Description' ) }
						component={ FormTextarea }
					/>
					<Fields
						names={ [ 'price', 'currency' ] }
						label={ translate( 'Price' ) }
						component={ renderPriceField }
					/>
					{ config.isEnabled( 'memberships' ) && (
						<ReduxFormFieldset name="recurring" type="checkbox" component={ CompactFormToggle }>
							{ translate( 'Make this product a recurring subscription.' ) }
						</ReduxFormFieldset>
					) }
					{ ! this.props.isRecurringSubscription && (
						<div>
							<ReduxFormFieldset name="multiple" type="checkbox" component={ CompactFormToggle }>
								{ translate( 'Allow people to buy more than one item at a time.' ) }
							</ReduxFormFieldset>
							<ReduxFormFieldset
								name="email"
								label={ translate( 'Email' ) }
								explanation={ translate(
									'This is where PayPal will send your money.' +
										" To claim a payment, you'll need a {{paypalLink}}PayPal account{{/paypalLink}}" +
										' connected to a bank account.',
									{
										components: {
											paypalLink: <ExternalLink href="https://paypal.com" target="_blank" />,
										},
									}
								) }
								component={ FormTextInput }
							/>
						</div>
					) }
					{ this.props.isRecurringSubscription && (
						<div>
							{ translate(
								'TODO: Here we need Stripe account connection and renewal schedule of the plan.'
							) }
						</div>
					) }
				</div>
			</form>
		);
	}
}

export default compose(
	localize, // must be the outer HOC, as the validation function relies on `translate` prop
	reduxForm( {
		form: REDUX_FORM_NAME,
		enableReinitialize: true,
		validate,
	} ),
	connect( state => {
		return {
			isRecurringSubscription: get( state, [ 'form', REDUX_FORM_NAME, 'values', 'recurring' ] ),
		};
	} )
)( ProductForm );
