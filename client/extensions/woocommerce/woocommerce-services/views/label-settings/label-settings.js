/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPaperSizes } from '../../lib/pdf-label-utils';
import Button from 'components/button';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import PaymentMethod from './label-payment-method';
import Spinner from 'components/spinner';

const ShippingLabels = ( { isLoading, paymentMethods, setFormDataValue, selectedPaymentMethod, paperSize, storeOptions, translate } ) => {
	const onPaymentMethodChange = ( value ) => setFormDataValue( 'selected_payment_method_id', value );
	const onPaperSizeChange = ( event ) => setFormDataValue( 'paper_size', event.target.value );

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
		<div className="label-settings__loading-spinner">
			<Spinner size={ 24 } />
		</div>
	);

	const renderContent = () => {
		if ( isLoading ) {
			return renderSpinner();
		}

		const paperSizes = getPaperSizes( storeOptions.origin_country );

		return (
			<div>
				<FormFieldSet>
					<FormLabel
						className="label-settings__cards-label">
						{ translate( 'Paper size' ) }
					</FormLabel>
					<FormSelect onChange={ onPaperSizeChange } value={ paperSize }>
						{ Object.keys( paperSizes ).map( ( size ) => (
							<option value={ size } key={ size }>{ paperSizes[ size ] }</option>
						) ) }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel
						className="label-settings__cards-label">
						{ translate( 'Credit card' ) }
					</FormLabel>
					<p className="label-settings__credit-card-description">
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
		<div className="label-settings__labels-container">
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
