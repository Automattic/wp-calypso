/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { reduxForm, Field, getFormValues, isValid, isDirty } from 'redux-form';
import { localize } from 'i18n-calypso';
import emailValidator from 'email-validator';
import { flowRight as compose, memoize } from 'lodash';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormCurrencyInput from 'components/forms/form-currency-input';
import CompactFormToggle from 'components/forms/form-toggle/compact';
import FormInputValidation from 'components/forms/form-input-validation';
import UploadImage from 'blocks/upload-image';

const REDUX_FORM_NAME = 'simplePaymentsForm';

// Export some selectors that are needed by the code that submits the form
export const getProductFormValues = state => getFormValues( REDUX_FORM_NAME )( state );
export const isProductFormValid = state => isValid( REDUX_FORM_NAME )( state );
export const isProductFormDirty = state => isDirty( REDUX_FORM_NAME )( state );

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
	const { currencyDefaults, translate } = props;
	const precision = currencyDefaults ? currencyDefaults.precision : 2;
	const errors = {};

	if ( ! values.title ) {
		errors.title = translate( 'Product name can not be empty.' );
	}

	if ( ! values.price ) {
		errors.price = translate( 'Price can not be empty.' );
	} else if ( parseFloat( values.price ) === NaN ) {
		errors.price = translate( 'Invalid price' );
	} else if ( parseFloat( values.price ) < 0 ) {
		errors.price = translate( 'Price can not be negative.' );
	} else if ( decimalPlaces( values.price ) > precision ) {
		if ( precision === 0 ) {
			errors.price = translate( 'Price can not have decimal places.' );
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
			errors.price = translate( 'Price can not have more than %(countDecimal)s.', {
				args: { countDecimal },
			} );
		}
	}

	if ( ! values.email ) {
		errors.email = translate( 'Email address can not be empty.' );
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

// Render a `FormFieldset` with given `redux-form` values, parametrized by the input
// field component type. Memoize the result to prevent creating a new component on
// every render call.
const renderField = memoize(
	FieldComponent => ( { input, meta, label, explanation, ...props } ) => {
		const isError = !! ( meta.touched && meta.error );

		return (
			<FormFieldset>
				<FormLabel htmlFor={ input.name }>
					{ label }
				</FormLabel>
				<FieldComponent id={ input.name } isError={ isError } { ...input } { ...props } />
				{ isError && <FormInputValidation isError text={ meta.error } /> }
				{ explanation &&
					<FormSettingExplanation>
						{ explanation }
					</FormSettingExplanation> }
			</FormFieldset>
		);
	}
);

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
		const { translate, currencyDefaults } = this.props;

		return (
			<form className="editor-simple-payments-modal__form">
				<Field
					name="featuredImageId"
					onError={ this.handleUploadImageError }
					component={ UploadImageField }
				/>
				<div className="editor-simple-payments-modal__form-fields">
					<Field
						name="title"
						label={ translate( 'What are you selling?' ) }
						placeholder={ translate( 'Product name' ) }
						component={ renderField( FormTextInput ) }
					/>
					<Field
						name="description"
						label={ translate( 'Description' ) }
						component={ renderField( FormTextarea ) }
					/>
					<Field
						name="price"
						label={ translate( 'Price' ) }
						currencySymbolPrefix={ currencyDefaults.symbol }
						placeholder="0.00"
						component={ renderField( FormCurrencyInput ) }
					/>
					<Field name="multiple" type="checkbox" component={ renderField( CompactFormToggle ) }>
						{ translate( 'Allow people to buy more than one item at a time.' ) }
					</Field>
					<Field
						name="email"
						label={ translate( 'Email' ) }
						explanation={ translate(
							'This is where PayPal will send your money.' +
								" To claim a payment, you'll need a PayPal account connected to a bank account."
						) }
						component={ renderField( FormTextInput ) }
					/>
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
