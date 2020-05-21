/**
 * External dependencies
 */

import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import Notice from 'components/notice';
import formatCurrency from '@automattic/format-currency';
/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import FormSectionHeading from 'components/forms/form-section-heading';
import FormSelect from 'components/forms/form-select';
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormLabel from 'components/forms/form-label';
import FormFieldset from 'components/forms/form-fieldset';
import FormToggle from 'components/forms/form-toggle';

const RecurringPaymentsPlanAddEditModal = ( {
	currencyList,
	isVisible,
	minimumCurrencyTransactionAmount,
	onClose,
	product,
} ) => {
	const translate = useTranslate();
	const initialPrice = product
		? { currency: product.currency, value: product.price }
		: { currency: 'USD', value: '' };
	const [ editedPrice, setEditedPrice ] = useState( initialPrice );
	const [ editedProductName, setEditedProductName ] = useState( product?.title ?? '' );
	const [ editedPayWhatYouWant, setEditedPayWhatYouWant ] = useState(
		product?.buyer_can_change_amount ?? false
	);
	const [ editedMultiplePerUser, setEditedMultiplePerUser ] = useState( false );
	const [ editedSchedule, setEditedSchedule ] = useState( '1 month' );
	const [ focusedName, setFocusedName ] = useState( false );

	const isValidCurrencyAmount = ( currency, price ) =>
		price >= minimumCurrencyTransactionAmount( currency );

	const isFormValid = ( field ) => {
		if (
			( field === 'price' || ! field ) &&
			! isValidCurrencyAmount( editedPrice.currency, editedPrice.value )
		) {
			return false;
		}
		if ( ( field === 'name' || ! field ) && editedProductName.length === 0 ) {
			return false;
		}
		return true;
	};

	const handleCurrencyChange = ( event ) => {
		const { value: currency } = event.currentTarget;
		setEditedPrice( { ...editedPrice, currency } );
	};
	const handlePriceChange = ( event ) => {
		const value = parseFloat( event.currentTarget.value );
		setEditedPrice( { ...editedPrice, value } );
	};
	const handlePayWhatYouWant = ( newValue ) => setEditedPayWhatYouWant( newValue );
	const handleMultiplePerUser = ( newValue ) => setEditedMultiplePerUser( newValue );
	const onNameChange = ( event ) => setEditedProductName( event.target.value );
	const onSelectSchedule = ( event ) => setEditedSchedule( event.target.value );

	return (
		<Dialog
			isVisible={ isVisible }
			onClose={ onClose }
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: product ? translate( 'Edit' ) : translate( 'Add' ),
					action: 'submit',
					disabled: ! isFormValid(),
				},
			] }
		>
			<FormSectionHeading>
				{ product ? translate( 'Edit' ) : translate( 'Add New Recurring Payment plan' ) }
			</FormSectionHeading>
			<p>
				{ product
					? translate( 'Edit your existing Recurring Payments plan.' )
					: translate(
							'Each amount you add will create a separate Recurring Payments plan. You can create multiple plans.'
					  ) }
			</p>
			<FormFieldset>
				<FormLabel htmlFor="currency">{ translate( 'Select price' ) }</FormLabel>
				{ product && (
					<Notice
						text={ translate(
							'Updating the price will not affect existing subscribers, who will pay what they were originally charged.'
						) }
						showDismiss={ false }
					/>
				) }
				<FormCurrencyInput
					name="currency"
					id="currency"
					value={ isNaN( editedPrice.value ) ? '' : editedPrice.value }
					onChange={ handlePriceChange }
					currencySymbolPrefix={ editedPrice.currency }
					onCurrencyChange={ handleCurrencyChange }
					currencyList={ currencyList }
					placeholder="0.00"
				/>
				{ ! isFormValid( 'price' ) && (
					<FormInputValidation
						isError
						text={ translate( 'Please enter a price higher than %s', {
							args: [
								formatCurrency(
									minimumCurrencyTransactionAmount( editedPrice.currency ),
									editedPrice.currency
								),
							],
						} ) }
					/>
				) }
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="renewal_schedule">{ translate( 'Select renewal schedule' ) }</FormLabel>
				<FormSelect id="renewal_schedule" value={ editedSchedule } onChange={ onSelectSchedule }>
					<option value="1 month">{ translate( 'Monthly' ) }</option>
					<option value="1 year">{ translate( 'Yearly' ) }</option>
				</FormSelect>
			</FormFieldset>
			<FormFieldset>
				<FormLabel htmlFor="title">{ translate( 'Please describe your subscription' ) }</FormLabel>
				<FormTextInput
					id="title"
					value={ editedProductName }
					onChange={ onNameChange }
					onBlur={ () => setFocusedName( true ) }
				/>
				{ ! isFormValid( 'name' ) && focusedName && (
					<FormInputValidation isError text={ translate( 'Please input a name.' ) } />
				) }
			</FormFieldset>
			<FormFieldset>
				<FormToggle onChange={ handlePayWhatYouWant } checked={ editedPayWhatYouWant }>
					{ translate( 'Enable customers to pick their own amount ("Pay what you want").' ) }
				</FormToggle>
			</FormFieldset>
			<FormFieldset>
				<FormToggle onChange={ handleMultiplePerUser } checked={ editedMultiplePerUser }>
					{ translate( 'Allow the same customer to sign up multiple times to the same plan.' ) }
				</FormToggle>
			</FormFieldset>
		</Dialog>
	);
};

export default RecurringPaymentsPlanAddEditModal;
