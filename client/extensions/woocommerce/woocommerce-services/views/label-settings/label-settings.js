/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPaperSizes } from 'lib/pdf-label-utils';
import Button from 'components/button';
import Dropdown from 'components/dropdown';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import PaymentMethod from './label-payment-method';
import Spinner from 'components/spinner';

const ShippingLabels = ( { isLoading, paymentMethods, setFormDataValue, selectedPaymentMethod, paperSize, storeOptions, translate } ) => {
	const onPaymentMethodChange = ( value ) => setFormDataValue( 'selected_payment_method_id', value );
	const onPaperSizeChange = ( value ) => setFormDataValue( 'paper_size', value );

	const renderPaymentMethod = ( method, index ) => {
		const onSelect = () => onPaymentMethodChange( method.payment_method_id );

		return (
			<PaymentMethod
				key={ index }
				selected={ selectedPaymentMethod === method.payment_method_id }
				type={ method.card_type }
				name={ method.name }
				digits={ method.card_digits }
				expiry={ method.expiry }
				onSelect={ onSelect } />
		);
	};

	const renderSpinner = () => (
		<div className="loading-spinner">
			<Spinner size={ 24 } />
		</div>
	);

	const renderContent = () => {
		if ( isLoading ) {
			return renderSpinner();
		}

		return (
			<div>
				<Dropdown
					id={ 'paper_size' }
					valuesMap={ getPaperSizes( storeOptions.origin_country ) }
					title={ translate( 'Paper size' ) }
					value={ paperSize }
					updateValue={ onPaperSizeChange } />
				<FormFieldSet>
					<FormLabel
						className="shipping__cards-label">
						{ translate( 'Credit card' ) }
					</FormLabel>
					<p className="shipping__credit-card-description">
						{ translate( 'Use your credit card on file to pay for the labels you print or add a new one.' ) }
					</p>
					{ paymentMethods.map( renderPaymentMethod ) }
					<Button href="https://wordpress.com/me/billing" target="_blank" compact>
						{ translate( 'Add another credit card' ) }
					</Button>
				</FormFieldSet>
			</div>
		);
	};

	return (
		<div className="shipping__labels-container">
			{ renderContent() }
		</div>
	);
};

ShippingLabels.propTypes = {
	isLoading: PropTypes.bool,
	paymentMethods: PropTypes.array,
	setFormDataValue: PropTypes.func,
	selectedPaymentMethod: PropTypes.number,
	paperSize: PropTypes.string,
	storeOptions: PropTypes.object,
};

export default localize( ShippingLabels );
