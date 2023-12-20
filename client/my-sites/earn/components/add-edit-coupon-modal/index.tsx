import { Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { ChangeEvent, useMemo, useState } from 'react';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { useSelector } from 'calypso/state';
import {
	getconnectedAccountDefaultCurrencyForSiteId,
	getconnectedAccountMinimumCurrencyForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	COUPON_DISCOUNT_TYPE_PERCENTAGE,
	COUPON_DISCOUNT_TYPE_AMOUNT,
	COUPON_DURATION_FOREVER,
	COUPON_DURATION_1_MONTH,
	COUPON_DURATION_3_MONTHS,
	COUPON_DURATION_6_MONTHS,
	COUPON_DURATION_1_YEAR,
	COUPON_PRODUCTS_ANY,
} from '../../memberships/constants';
import { Coupon } from '../../types';

type RecurringPaymentsPlanAddEditModalProps = {
	closeDialog: () => void;
	coupon: Coupon;
	siteId?: number;
};

type StripeMinimumCurrencyAmounts = {
	[ key: string ]: number;
};

/**
 * Return the minimum transaction amount for a currency.
 * If the defaultCurrency is not the same as the current currency, return the double, in order to prevent issues with Stripe minimum amounts
 * See https://wp.me/p81Rsd-1hN
 */
function minimumCurrencyTransactionAmount(
	currency_min: StripeMinimumCurrencyAmounts,
	currency: string,
	connectedAccountDefaultCurrency: string
): number {
	if ( connectedAccountDefaultCurrency.toUpperCase() === currency ) {
		return currency_min[ currency ];
	}
	return currency_min[ currency ] * 2;
}

const RecurringPaymentsCouponAddEditModal = ( {
	closeDialog,
	coupon,
	siteId,
}: RecurringPaymentsPlanAddEditModalProps ) => {
	/** Currency */
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const connectedAccountDefaultCurrency = useSelector( ( state ) =>
		getconnectedAccountDefaultCurrencyForSiteId( state, siteId ?? selectedSiteId )
	);
	const connectedAccountMinimumCurrency = useSelector( ( state ) =>
		getconnectedAccountMinimumCurrencyForSiteId( state, siteId ?? selectedSiteId )
	);
	const currencyList = Object.keys( connectedAccountMinimumCurrency );
	const defaultDiscountCurrency = useMemo( () => {
		if ( coupon?.discount_currency ) {
			return coupon?.discount_currency;
		}
		// Return the Stripe currency if supported. Otherwise default to USD
		if ( currencyList.includes( connectedAccountDefaultCurrency ) ) {
			return connectedAccountDefaultCurrency;
		}
		return 'USD';
	}, [ coupon, connectedAccountDefaultCurrency ] );
	const [ currentDiscountCurrency, setCurrentDiscountCurrency ] =
		useState( defaultDiscountCurrency );
	const onDiscountCurrencyChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		const { value: currency } = event.currentTarget;
		setCurrentDiscountCurrency( currency );
	};

	/** Dialog operations */
	const onClose = () => {
		closeDialog();
	};

	/** Edited form values */
	const [ editedCouponCode, setEditedCouponCode ] = useState( coupon?.coupon_code ?? '' );
	const [ editedDescription, setEditedDescription ] = useState( coupon?.description ?? '' );
	const [ editedDiscountType, setEditedDiscountType ] = useState(
		coupon?.discount_type ?? COUPON_DISCOUNT_TYPE_PERCENTAGE
	);
	const [ editedDiscountAmount, setEditedDiscountAmount ] = useState( () => {
		if ( COUPON_DISCOUNT_TYPE_AMOUNT === editedDiscountType ) {
			return (
				coupon?.discount_amount ??
				minimumCurrencyTransactionAmount(
					connectedAccountMinimumCurrency,
					currentDiscountCurrency,
					connectedAccountDefaultCurrency
				)
			);
		}
		return coupon?.discount_amount ?? '';
	} );
	const [ editedStartDate, setEditedStartDate ] = useState( coupon?.start_date ?? '' );
	const [ editedEndDate, setEditedEndDate ] = useState( coupon?.end_date ?? '' );
	const [ editedProducts, setEditedProducts ] = useState( coupon?.products ?? [] );
	const [ editedUsageLimit, setEditedUsageLimit ] = useState( coupon?.usage_limit ?? 0 );
	const [ editedCanBeCombined, setEditedCanBeCombined ] = useState(
		coupon?.can_be_combined ?? false
	);
	const [ editedFirstTimeOnly, setEditedFirstTimeOnly ] = useState(
		coupon?.first_time_only ?? false
	);
	const [ editedUseDuration, setEditedUseDuration ] = useState( coupon?.use_duration ?? false );
	const [ editedDuration, setEditedDuration ] = useState(
		coupon?.duration ?? COUPON_DURATION_FOREVER
	);
	const [ editedUseSpecificEmails, setEditedUseSpecificEmails ] = useState(
		coupon?.use_specific_emails ?? false
	);
	const [ editedSpecificEmails, setEditedSpecificEmails ] = useState(
		coupon?.specific_emails ?? ''
	);

	/** Form event handlers */
	const onCouponCodeChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedCouponCode( event.target.value );
	const onDescriptionChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedDescription( event.target.value );
	const onSelectDiscountType = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedDiscountType( event.target.value );
	const onDiscountAmountChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedDiscountAmount( event.target.value );
	const onStartDateChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedStartDate( event.target.value );
	const onEndDateChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedEndDate( event.target.value );
	const onSelectProducts = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedProducts( event.target.value );
	const onUsageLimitChange = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedUsageLimit( parseInt( event.target.value ) ?? 0 );
	const onSelectDuration = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedDuration( event.target.value );
	const onSpecificEmailsChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedSpecificEmails( event.target.value );

	/** Form validation */
	const [ focusedCouponCode, setFocusedCouponCode ] = useState( false );
	const isFormValid = ( field?: string ) => {
		if ( ( field === 'coupon_code' || ! field ) && editedCouponCode === '' ) {
			return false;
		}
	};

	/** Labels */
	const addCoupon = translate( 'Add new coupon' );
	const editCoupon = translate( 'Edit coupon' );
	const editing = coupon && coupon.ID;

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
				<FormFieldset>
					<FormLabel htmlFor="description">{ translate( 'Description' ) }</FormLabel>
					<FormTextInput
						id="description"
						value={ editedDescription }
						onChange={ onDescriptionChange }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-seconds-price">
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="discount_type">{ translate( 'Discount type' ) }</FormLabel>
						<FormSelect
							id="discount_type"
							value={ editedDiscountType }
							onChange={ onSelectDiscountType }
							noWrap
						>
							<option value={ COUPON_DISCOUNT_TYPE_PERCENTAGE }>
								{ translate( 'Percentage' ) }
							</option>
							<option value={ COUPON_DISCOUNT_TYPE_AMOUNT }>{ translate( 'Amount' ) }</option>
						</FormSelect>
					</div>
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="amount">{ translate( 'Amount' ) }</FormLabel>
						{ COUPON_DISCOUNT_TYPE_PERCENTAGE === editedDiscountType && (
							<FormTextInputWithAffixes
								id="discount_amount"
								value={ editedDiscountAmount }
								prefix="%"
								onChange={ onDiscountAmountChange }
								noWrap
							/>
						) }
						{ COUPON_DISCOUNT_TYPE_AMOUNT === editedDiscountType && (
							<FormCurrencyInput
								name="discount_type"
								id="discount_type"
								value={ editedDiscountAmount }
								onChange={ onDiscountAmountChange }
								currencySymbolPrefix={ currentDiscountCurrency }
								onCurrencyChange={ onDiscountCurrencyChange }
								currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
								placeholder="0.00"
								noWrap
								className={ null }
								currencySymbolSuffix={ null }
							/>
						) }
					</div>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-seconds-price">
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="discount_type">{ translate( 'Start date' ) }</FormLabel>
						<FormTextInput
							id="start_date"
							type="date"
							value={ editedStartDate }
							onChange={ onStartDateChange }
							noWrap
						/>
					</div>
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="amount">{ translate( 'Expiration date (optional)' ) }</FormLabel>
						<FormTextInput
							id="end_date"
							type="date"
							value={ editedEndDate }
							onChange={ onEndDateChange }
							noWrap
						/>
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="coupon_code">{ translate( 'Products' ) }</FormLabel>
					<FormSelect id="products" value={ editedProducts } onChange={ onSelectProducts }>
						<option value={ COUPON_PRODUCTS_ANY }>{ translate( 'Any product' ) }</option>
					</FormSelect>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="coupon_code">{ translate( 'Usage limit (optional)' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="usage_limit"
						suffix="times"
						value={ editedUsageLimit === 0 ? '∞' : editedUsageLimit }
						onChange={ onUsageLimitChange }
					/>
					<FormSettingExplanation>
						{ translate( 'Limit the number of times this coupon can be redeemed by a supporter.' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-type">
					<ToggleControl
						onChange={ ( newValue ) => setEditedCanBeCombined( newValue ) }
						checked={ editedCanBeCombined }
						label={ translate( 'Cannot be combined with other coupons' ) }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-type">
					<ToggleControl
						onChange={ ( newValue ) => setEditedFirstTimeOnly( newValue ) }
						checked={ editedFirstTimeOnly }
						label={ translate( 'Eligible for first-time order only' ) }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-type">
					<ToggleControl
						onChange={ ( newValue ) => setEditedUseDuration( newValue ) }
						checked={ editedUseDuration }
						label={ translate( 'Duration' ) }
					/>
					<FormSelect
						id="duration"
						value={ editedDuration }
						onChange={ onSelectDuration }
						disabled={ ! editedUseDuration }
					>
						<option value={ COUPON_DURATION_FOREVER }>{ translate( 'Forever' ) }</option>
						<option value={ COUPON_DURATION_1_MONTH }>{ translate( '1 Month' ) }</option>
						<option value={ COUPON_DURATION_3_MONTHS }>{ translate( '3 Months' ) }</option>
						<option value={ COUPON_DURATION_6_MONTHS }>{ translate( '6 Months' ) }</option>
						<option value={ COUPON_DURATION_1_YEAR }>{ translate( '1 Year' ) }</option>
					</FormSelect>
					<FormSettingExplanation>
						{ translate( 'Once the coupon is used for a subscription, how long does it last?' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-type">
					<ToggleControl
						onChange={ ( newValue ) => setEditedUseSpecificEmails( newValue ) }
						checked={ editedUseSpecificEmails }
						label={ translate( 'Limit coupon to specific emails' ) }
					/>
					<FormTextInput
						id="specific_emails"
						value={ editedSpecificEmails }
						onChange={ onSpecificEmailsChange }
						disabled={ ! editedUseSpecificEmails }
					/>
					<FormSettingExplanation>
						{ translate(
							'Separate email addresses with commas. Use an asterisk (*) to match parts of an email. For example, "*@university.edu" would select all "university.edu" addresses.'
						) }
					</FormSettingExplanation>
				</FormFieldset>
			</div>
		</Dialog>
	);
};

export default RecurringPaymentsCouponAddEditModal;
