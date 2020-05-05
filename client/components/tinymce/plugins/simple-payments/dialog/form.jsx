/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { reduxForm, Field, Fields, getFormValues, isValid, isDirty } from 'redux-form';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';
import { flowRight as compose, omit, padEnd, trimEnd } from 'lodash';
import { getCurrencyDefaults } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { decimalPlaces } from 'lib/simple-payments/utils';
import ExternalLink from 'components/external-link';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormCurrencyInput from 'components/forms/form-currency-input';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import ReduxFormFieldset, { FieldsetRenderer } from 'components/redux-forms/redux-form-fieldset';
import ProductImagePicker from './product-image-picker';
import { SUPPORTED_CURRENCY_LIST } from 'lib/simple-payments/constants';

export const REDUX_FORM_NAME = 'simplePaymentsForm';

// Export some selectors that are needed by the code that submits the form
export const getProductFormValues = ( state ) => getFormValues( REDUX_FORM_NAME )( state );
export const isProductFormValid = ( state ) => isValid( REDUX_FORM_NAME )( state );
export const isProductFormDirty = ( state ) => isDirty( REDUX_FORM_NAME )( state );

const VISUAL_CURRENCY_LIST = SUPPORTED_CURRENCY_LIST.map( ( code ) => {
	const { symbol } = getCurrencyDefaults( code );
	// if symbol is equal to the code (e.g., 'CHF' === 'CHF'), don't duplicate it.
	// trim the dot at the end, e.g., 'kr.' becomes 'kr'
	const label = symbol === code ? code : `${ code } ${ trimEnd( symbol, '.' ) }`;
	return { code, label };
} );

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
	} else if ( Number.isNaN( parseFloat( values.price ) ) ) {
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

class ProductForm extends Component {
	render() {
		const { translate, makeDirtyAfterImageEdit } = this.props;

		return (
			<form className="editor-simple-payments-modal__form">
				<Field
					name="featuredImageId"
					component={ ProductImagePicker }
					makeDirtyAfterImageEdit={ makeDirtyAfterImageEdit }
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
	} )
)( ProductForm );
