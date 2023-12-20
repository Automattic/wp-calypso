import { Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import {
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DISCOUNT_TYPE_AMOUNT,
} from '../../memberships/constants';

type RecurringPaymentsPlanAddEditModalProps = {
	closeDialog: () => void;
	coupon: Coupon;
	siteId?: number;
};

const RecurringPaymentsCouponAddEditModal = ( {
	closeDialog,
	coupon,
}: RecurringPaymentsPlanAddEditModalProps ) => {
	const onClose = () => {
		closeDialog();
	};

	const isFormValid = () => {
		return true;
	};

	const [ editedCouponCode, setEditedCouponCode ] = useState( coupon?.coupon_code ?? '' );
	const [ editedDiscountType, setEditedDiscountType ] = useState( coupon?.discount_type ?? '' );
	const [ editedDiscountAmount, setEditedDiscountAmount ] = useState(
		coupon?.discount_amount ?? ''
	);
	const [ focusedCouponCode, setFocusedCouponCode ] = useState( false );

	const addCoupon = translate( 'Add new coupon' );
	const editCoupon = translate( 'Edit coupon' );
	const editing = coupon && coupon.ID;

	const onCouponCodeChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedCouponCode( event.target.value );
	const onSelectDiscountType = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedDiscountType( event.target.value );
	const onDiscountAmountChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedDiscountAmount( event.target.value );

	return (
		<Dialog
			isVisible={ true }
			onClose={ onClose }
			buttons={ [
				{
					label: translate( 'Cancel' ),
					action: 'cancel',
				},
				{
					label: translate( 'Save' ),
					action: 'submit',
					disabled: ! isFormValid(),
					isPrimary: true,
				},
			] }
		>
			<FormSectionHeading>{ editing ? editCoupon : addCoupon }</FormSectionHeading>
			<div className="memberships__dialog-sections">
				<FormFieldset>
					<FormLabel htmlFor="coupon_code">{ translate( 'Coupon code' ) }</FormLabel>
					<FormTextInput
						id="coupon_code"
						value={ editedCouponCode }
						onChange={ onCouponCodeChange }
						onBlur={ () => setFocusedCouponCode( true ) }
					/>
					<FormSettingExplanation>
						{ translate( 'Choose a unique coupon code for the discount. Not case-sensitive.' ) }
					</FormSettingExplanation>
					{ ! isFormValid( 'coupon_code' ) && focusedCouponCode && (
						<FormInputValidation isError text={ translate( 'Please input a coupon code.' ) } />
					) }
				</FormFieldset>
				<FormFieldset className="memberships__dialog-seconds-price">
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="discount_type">{ translate( 'Discount type' ) }</FormLabel>
						<FormSelect
							id="discount_type"
							value={ editedDiscountType }
							onChange={ onSelectDiscountType }
						>
							<option value={ COUPON_DISCOUNT_TYPE_PERCENTAGE }>
								{ translate( 'Percentage' ) }
							</option>
							<option value={ COUPON_DISCOUNT_TYPE_AMOUNT }>{ translate( 'Amount' ) }</option>
						</FormSelect>
					</div>
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="amount">{ translate( 'Amount' ) }</FormLabel>
						<FormTextInputWithAffixes
							id="discount_amount"
							value={ editedDiscountAmount }
							prefix="%"
							onChange={ onDiscountAmountChange }
						/>
					</div>
				</FormFieldset>
			</div>
		</Dialog>
	);
};

export default RecurringPaymentsCouponAddEditModal;
