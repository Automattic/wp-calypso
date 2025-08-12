import { Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { ChangeEvent, useMemo, useState, useCallback } from 'react';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import ProductsSelector from 'calypso/my-sites/earn/components/add-edit-coupon-modal/products-selector';
import { useSelector, useDispatch } from 'calypso/state';
import {
	requestAddCoupon,
	requestUpdateCoupon,
} from 'calypso/state/memberships/coupon-list/actions';
import { getCouponsForSiteId } from 'calypso/state/memberships/coupon-list/selectors';
import { getProductsForSiteId } from 'calypso/state/memberships/product-list/selectors';
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
	COUPON_RANDOM_GENERATOR_CHARSET,
	COUPON_RANDOM_GENERATOR_LENGTH,
	COUPON_USAGE_LIMIT_INFINITE,
} from '../../memberships/constants';
import { Product, Coupon } from '../../types';
import FormTextInputWithRandomCodeGeneration from '../form-text-input-with-value-generation';
import './style.scss';

type RecurringPaymentsCouponAddEditModalProps = {
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
}: RecurringPaymentsCouponAddEditModalProps ) => {
	const today = new Date();

	const dispatch = useDispatch();

	/** Currency */
	const selectedSiteId = useSelector( getSelectedSiteId );
	const connectedAccountDefaultCurrency = useSelector( ( state ) =>
		getconnectedAccountDefaultCurrencyForSiteId( state, selectedSiteId )
	);
	const connectedAccountMinimumCurrency = useSelector( ( state ) =>
		getconnectedAccountMinimumCurrencyForSiteId( state, selectedSiteId )
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
	}, [ coupon, connectedAccountDefaultCurrency, currencyList ] );

	/** Other datasets */
	const products: Product[] = useSelector( ( state ) =>
		getProductsForSiteId( state, selectedSiteId )
	);
	const coupons: Coupon[] = useSelector( ( state ) =>
		getCouponsForSiteId( state, selectedSiteId )
	);

	/** Edited form values */
	const [ editedCouponCode, setEditedCouponCode ] = useState( coupon?.coupon_code ?? '' );
	const [ editedDiscountType, setEditedDiscountType ] = useState(
		coupon?.discount_type ?? COUPON_DISCOUNT_TYPE_PERCENTAGE
	);
	const [ editedDiscountPercentage, setEditedDiscountPercentage ] = useState(
		coupon?.discount_percentage ?? 0
	);
	const [ editedDiscountCurrency, setEditedDiscountCurrency ] = useState(
		coupon?.discount_currency ?? defaultDiscountCurrency
	);
	const [ editedDiscountValue, setEditedDiscountValue ] = useState( () => {
		if ( COUPON_DISCOUNT_TYPE_AMOUNT === editedDiscountType ) {
			return (
				coupon?.discount_value ??
				minimumCurrencyTransactionAmount(
					connectedAccountMinimumCurrency,
					editedDiscountCurrency,
					connectedAccountDefaultCurrency
				)
			);
		}
		return coupon?.discount_value ?? 0;
	} );
	const [ editedStartDate, setEditedStartDate ] = useState(
		coupon?.start_date ?? `${ today.getFullYear() }-${ today.getMonth() + 1 }-${ today.getDate() }`
	);
	const [ editedEndDate, setEditedEndDate ] = useState( coupon?.end_date ?? '' );
	const [ editedPlanIdsAllowList, setEditedPlanIdsAllowList ] = useState(
		coupon?.plan_ids_allow_list ?? []
	);
	const [ editedLimitPerUser, setEditedLimitPerUser ] = useState( coupon?.limit_per_user ?? 0 );
	const [ editedCannotBeCombined, setEditedCannotBeCombined ] = useState(
		coupon?.cannot_be_combined ?? false
	);
	const [ editedFirstTimePurchaseOnly, setEditedFirstTimePurchaseOnly ] = useState(
		coupon?.first_time_purchase_only ?? false
	);
	const [ editedDuration, setEditedDuration ] = useState(
		coupon?.duration ?? COUPON_DURATION_FOREVER
	);
	const [ editedUseDuration, setEditedUseDuration ] = useState(
		coupon?.use_duration ?? editedDuration !== COUPON_DURATION_FOREVER ?? false
	);
	const [ editedUseEmailAllowList, setEditedUseEmailAllowList ] = useState(
		coupon?.email_allow_list?.length && coupon?.email_allow_list?.length > 0
	);
	const [ editedEmailAllowListCSV, setEditedEmailAllowListCSV ] = useState(
		coupon?.email_allow_list?.join( ', ' ) ?? ''
	);
	const [ editedEmailAllowList, setEditedEmailAllowList ] = useState(
		coupon?.email_allow_list ?? []
	);
	const [ invalidEmailsInAllowList, setInvalidEmailsInAllowList ] = useState( false );
	const [ invalidEditedEmailAllowListLabel, setInvalidEditedEmailAllowListLabel ] = useState( '' );
	const [ focusedCouponCode, setFocusedCouponCode ] = useState( false );
	const [ focusedStartDate, setFocusedStartDate ] = useState( false );
	const [ focusedEndDate, setFocusedEndDate ] = useState( false );
	const [ focusedDiscountType, setFocusedDiscountType ] = useState( false );
	const [ focusedDiscountPercentage, setFocusedDiscountPercentage ] = useState( false );
	const [ focusedDiscountValue, setFocusedDiscountValue ] = useState( false );
	const [ focusedLimitPerUser, setFocusedLimitPerUser ] = useState( false );
	const [ focusedEmailAllowList, setFocusedEmailAllowList ] = useState( false );
	const [ isCharacterMinReached, setisCharacterMinReached ] = useState( false );
	const [ isCharacterMaxReached, setisCharacterMaxReached ] = useState( false );

	/** Coupon functions */
	const generateRandomCouponCode = (): string => {
		let code = '';
		let available = true;
		for ( let i = 0; i < COUPON_RANDOM_GENERATOR_LENGTH; i++ ) {
			code += COUPON_RANDOM_GENERATOR_CHARSET.charAt(
				Math.floor( Math.random() * COUPON_RANDOM_GENERATOR_CHARSET.length )
			);
		}
		coupons.forEach( ( coupon ) => {
			if ( coupon === coupon.coupon_code ) {
				available = false;
			}
		} );
		if ( available ) {
			return code;
		}
		return generateRandomCouponCode();
	};

	/** Email address functions */
	const validateEmailAddress = ( email: string ): boolean =>
		/^[\w.\-+*]+@(?:(?:[\w\-*]+(?:\.[\w\-*]+)+)+|(?:[\w\-*]*\*[\w\-*]*)+)+$/.test( email );

	/** Form event handlers */
	const onCouponCodeChange = useCallback( ( event: ChangeEvent< HTMLInputElement > ) => {
		const newValue = event.target.value;
		setEditedCouponCode( newValue );
	}, [] );
	const handleCharacterMinLimitReached = useCallback( ( isMet: boolean ) => {
		setisCharacterMinReached( isMet );
	}, [] );
	const handleCharacterMaxLimitReached = useCallback( ( isMet: boolean ) => {
		setisCharacterMaxReached( isMet );
	}, [] );
	const onCouponCodeRandomize = () => {
		const code = generateRandomCouponCode();
		setEditedCouponCode( code );
	};
	const onSelectDiscountType = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedDiscountType( event.target.value );
	const onDiscountCurrencyChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		const { value: currency } = event.currentTarget;
		setEditedDiscountCurrency( currency );
	};
	const onDiscountValueChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedDiscountValue( parseFloat( event.target.value ) );
	const onDiscountPercentageChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedDiscountPercentage( parseFloat( event.target.value ) );
	const onStartDateChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedStartDate( event.target.value );
	const onEndDateChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedEndDate( event.target.value );
	const onLimitPerUserChange = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedLimitPerUser( parseInt( event.target.value ) );
	const onLimitPerUserBlur = ( event: ChangeEvent< HTMLSelectElement > ) => {
		setFocusedLimitPerUser( true );
		setEditedLimitPerUser(
			parseInt( event.target.value ) > 0 ? parseInt( event.target.value ) : 0
		);
	};
	const onSelectDuration = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedDuration( event.target.value );
	const onStartDateBlur = () => setFocusedStartDate( true );
	const onEndDateBlur = () => setFocusedEndDate( true );
	const onDiscountPercentageBlur = () => setFocusedDiscountPercentage( true );
	const onDiscountValueBlur = () => setFocusedDiscountValue( true );
	const onEmailAllowListChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedEmailAllowListCSV( event.target.value );
	const onEmailAllowListBlur = ( event: ChangeEvent< HTMLInputElement > ) => {
		const allEmails = event.target.value.split( ',' ).map( ( email: string ) => email.trim() );

		const validEmails = allEmails.filter( ( email: string ) => validateEmailAddress( email ) );
		const invalidEmails = allEmails.filter(
			( email: string ) => email.trim().length > 0 && ! validEmails.includes( email )
		);
		if ( invalidEmails.length > 0 ) {
			setInvalidEmailsInAllowList( true );
			setInvalidEditedEmailAllowListLabel( invalidEmails.join( ', ' ) );
		} else {
			setInvalidEmailsInAllowList( false );
			setInvalidEditedEmailAllowListLabel( '' );
			setEditedEmailAllowList( validEmails );
		}
		setFocusedEmailAllowList( true );
	};
	const onDiscountTypeBlur = () => setFocusedDiscountType( true );
	const onLimitPerUserFocus = ( event: ChangeEvent< HTMLInputElement > ) => {
		if ( event.target.value === COUPON_USAGE_LIMIT_INFINITE ) {
			event.target.value = '';
		}
	};
	const onDiscountAmountFocus = ( event: ChangeEvent< HTMLInputElement > ) => {
		if ( event.target.value === '0' ) {
			event.target.value = '';
		}
	};

	const dateRegex = /\d{4}-\d{1,2}-\d{1,2}/;

	/** Form validation */
	const isFormValid = ( field?: string ) => {
		if ( field === 'coupon_code' || ! field ) {
			if ( isCharacterMinReached ) {
				return false;
			}

			if ( ! /[a-zA-Z0-9-]+/.test( editedCouponCode ) ) {
				return false;
			}
		}

		if (
			( field === 'discount_type' || ! field ) &&
			( ! editedDiscountType ||
				! [ COUPON_DISCOUNT_TYPE_AMOUNT, COUPON_DISCOUNT_TYPE_PERCENTAGE ].includes(
					editedDiscountType
				) )
		) {
			return false;
		}

		if (
			( field === 'discount_value' || ! field ) &&
			COUPON_DISCOUNT_TYPE_AMOUNT === editedDiscountType &&
			editedDiscountValue <= 0
		) {
			return false;
		}

		if (
			( field === 'discount_percentage' || ! field ) &&
			COUPON_DISCOUNT_TYPE_PERCENTAGE === editedDiscountType &&
			( editedDiscountPercentage > 100 || editedDiscountPercentage <= 0 )
		) {
			return false;
		}

		if ( ( field === 'start_date' || ! field ) && ! dateRegex.test( editedStartDate ) ) {
			return false;
		}

		if (
			( field === 'start_date' || ! field ) &&
			editedEndDate &&
			editedStartDate &&
			( new Date( editedEndDate ).getTime() < new Date( editedStartDate ).getTime() ||
				! dateRegex.test( editedStartDate ) )
		) {
			return false;
		}

		if (
			( field === 'end_date' || ! field ) &&
			! coupon?.ID &&
			editedEndDate &&
			new Date( editedEndDate ).getTime() < today.getTime()
		) {
			return false;
		}
		if ( ( field === 'email_allow_list' || ! field ) && editedUseEmailAllowList ) {
			// invalid if the array of invalid edited emails contains any values.
			if ( invalidEmailsInAllowList ) {
				return false;
			}

			// invalid if the (validated) array of editedEmailAllowList is empty (but specific emails are in use).
			if ( editedEmailAllowList.length === 0 ) {
				return false;
			}
		}

		if (
			( field === 'duration' || ! field ) &&
			! [
				COUPON_DURATION_FOREVER,
				COUPON_DURATION_1_MONTH,
				COUPON_DURATION_1_YEAR,
				COUPON_DURATION_3_MONTHS,
				COUPON_DURATION_6_MONTHS,
			].includes( editedDuration )
		) {
			return false;
		}

		if (
			( field === 'products' || ! field ) &&
			typeof editedPlanIdsAllowList === typeof [] &&
			editedPlanIdsAllowList.length > 0
		) {
			// In the event that the form is tampered with, don't allow planIds to be included which are outside of the existing planIds.
			const allProductIds = products.map( ( product ) => product.ID );
			if (
				editedPlanIdsAllowList.filter( ( planId ) => ! allProductIds.includes( planId ) ).length > 0
			) {
				return false;
			}
		}

		if ( ( field === 'limit_per_user' || ! field ) && editedLimitPerUser < 0 ) {
			return false;
		}

		return true;
	};

	/** Dialog operations */
	const onClose = ( reason: string | undefined ): void => {
		const couponDetails: Coupon = {
			coupon_code: editedCouponCode,
			discount_type: editedDiscountType,
			discount_value: editedDiscountValue,
			discount_percentage: editedDiscountPercentage,
			discount_currency: editedDiscountCurrency,
			start_date: editedStartDate,
			end_date: editedEndDate,
			plan_ids_allow_list: editedPlanIdsAllowList,
			cannot_be_combined: editedCannotBeCombined,
			can_be_combined: ! editedCannotBeCombined,
			first_time_purchase_only: editedFirstTimePurchaseOnly,
			use_duration: editedUseDuration,
			duration: editedDuration,
			use_email_allow_list: !! editedUseEmailAllowList,
			email_allow_list: editedEmailAllowList,
		};

		if ( reason === 'submit' && ( ! coupon || ! coupon.ID ) ) {
			dispatch(
				requestAddCoupon(
					selectedSiteId,
					couponDetails,
					translate( 'Added coupon "%s".', { args: editedCouponCode } )
				)
			);
		} else if ( reason === 'submit' && coupon && coupon.ID ) {
			couponDetails.ID = coupon.ID;
			dispatch(
				requestUpdateCoupon(
					selectedSiteId,
					couponDetails,
					translate( 'Updated coupon "%s".', { args: editedCouponCode } )
				)
			);
		}
		closeDialog();
	};

	/** Labels */
	const addCoupon = translate( 'Add new coupon' );
	const editCoupon = translate( 'Edit coupon' );
	const editing = coupon && coupon.ID;

	return (
		<Dialog
			isVisible
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
				<FormFieldset className="memberships__dialog-sections-coupon-code">
					<FormLabel htmlFor="coupon_code">{ translate( 'Coupon code' ) }</FormLabel>
					<FormTextInputWithRandomCodeGeneration
						id="coupon_code"
						value={ editedCouponCode }
						action={ translate( 'Random' ) }
						buttonAriaLabel={ translate( 'Generate random coupon code' ) }
						textInputAriaLabel={ translate( 'Enter a custom coupon code' ) }
						onChange={ onCouponCodeChange }
						onAction={ onCouponCodeRandomize }
						onCharacterMinReached={ handleCharacterMinLimitReached }
						onCharacterMaxReached={ handleCharacterMaxLimitReached }
						isError={ ! isFormValid( 'coupon_code' ) }
						isValid={ isFormValid( 'coupon_code' ) }
						minLength="3"
						maxLength="20"
						onBlur={ () => setFocusedCouponCode( true ) }
					/>
					<FormSettingExplanation>
						{ translate( 'Choose a unique coupon code for the discount. Not case-sensitive.' ) }
					</FormSettingExplanation>
					{ ! isFormValid( 'coupon_code' ) && ! isCharacterMinReached && focusedCouponCode && (
						<FormInputValidation isError text={ translate( 'Please input a coupon code.' ) } />
					) }
					{ isCharacterMinReached && (
						<FormInputValidation
							isError
							text={ translate( 'Coupon codes must be at least 3 characters' ) }
						/>
					) }
					{ isCharacterMaxReached && (
						<FormInputValidation
							isError={ false }
							isWarning
							text={ translate(
								'The coupon code maximum length of 20 characters has been reached'
							) }
						/>
					) }
				</FormFieldset>

				<FormFieldset className="memberships__dialog-sections-discount-info">
					<div className="memberships__dialog-sections-discount-info-field-container">
						<FormLabel htmlFor="discount_type">{ translate( 'Discount type' ) }</FormLabel>
						<FormSelect
							id="discount_type"
							value={ editedDiscountType }
							onChange={ onSelectDiscountType }
							onBlur={ onDiscountTypeBlur }
						>
							<option value={ COUPON_DISCOUNT_TYPE_PERCENTAGE }>
								{ translate( 'Percentage' ) }
							</option>
							<option value={ COUPON_DISCOUNT_TYPE_AMOUNT }>{ translate( 'Amount' ) }</option>
						</FormSelect>
						{ ! isFormValid( 'discount_type' ) && focusedDiscountType && (
							<FormInputValidation isError text={ translate( 'Please select a valid type' ) } />
						) }
					</div>
					<div className="memberships__dialog-sections-discount-info-field-container">
						<FormLabel>{ translate( 'Amount' ) }</FormLabel>
						{ COUPON_DISCOUNT_TYPE_PERCENTAGE === editedDiscountType && (
							<FormTextInputWithAffixes
								id="discount_amount"
								name="discount_percentage"
								value={ editedDiscountPercentage }
								suffix="%"
								onChange={ onDiscountPercentageChange }
								onFocus={ onDiscountAmountFocus }
								onBlur={ onDiscountPercentageBlur }
								role="textbox"
								aria-label={ translate( 'Discount percentage' ) }
							/>
						) }
						{ ! isFormValid( 'discount_percentage' ) && focusedDiscountPercentage && (
							<FormInputValidation isError text={ translate( 'Please enter a valid amount' ) } />
						) }
						{ COUPON_DISCOUNT_TYPE_AMOUNT === editedDiscountType && (
							<FormCurrencyInput
								name="discount_value"
								id="discount_amount"
								value={ editedDiscountValue }
								onChange={ onDiscountValueChange }
								onFocus={ onDiscountAmountFocus }
								onBlur={ onDiscountValueBlur }
								currencySymbolPrefix={ editedDiscountCurrency }
								onCurrencyChange={ onDiscountCurrencyChange }
								currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
								placeholder="0.00"
								role="textbox"
								aria-label={ translate( 'Discount value' ) }
							/>
						) }
						{ ! isFormValid( 'discount_value' ) && focusedDiscountValue && (
							<FormInputValidation isError text={ translate( 'Please enter a valid amount' ) } />
						) }
					</div>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-date">
					<div className="memberships__dialog-sections-date-field-container">
						<FormLabel htmlFor="start_date">{ translate( 'Start date' ) }</FormLabel>
						<FormTextInput
							id="start_date"
							type="date"
							value={ editedStartDate }
							onChange={ onStartDateChange }
							onBlur={ onStartDateBlur }
						/>
						{ ! isFormValid( 'start_date' ) && focusedStartDate && (
							<FormInputValidation
								isError
								text={ translate( 'Please enter a valid start date' ) }
							/>
						) }
					</div>
					<div className="memberships__dialog-sections-date-field-container">
						<FormLabel htmlFor="amount">{ translate( 'Expiration date (optional)' ) }</FormLabel>
						<FormTextInput
							id="end_date"
							type="date"
							value={ editedEndDate }
							onChange={ onEndDateChange }
							onBlur={ onEndDateBlur }
						/>
						{ ! isFormValid( 'end_date' ) && focusedEndDate && (
							<FormInputValidation isError text={ translate( 'Please enter a valid end date' ) } />
						) }
					</div>
				</FormFieldset>
				<ProductsSelector
					onSelectedPlanIdsChange={ ( list ) => setEditedPlanIdsAllowList( list ) }
					initialSelectedList={ editedPlanIdsAllowList }
					allowMultiple
				/>
				<FormFieldset className="memberships__dialog-sections-usage-limit">
					<FormLabel htmlFor="coupon_code">{ translate( 'Usage limit (optional)' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="limit_per_user"
						suffix="times"
						value={ editedLimitPerUser === 0 ? COUPON_USAGE_LIMIT_INFINITE : editedLimitPerUser }
						onFocus={ onLimitPerUserFocus }
						onChange={ onLimitPerUserChange }
						onBlur={ onLimitPerUserBlur }
					/>
					<FormSettingExplanation>
						{ translate( 'Limit the number of times this coupon can be redeemed by a supporter.' ) }
					</FormSettingExplanation>
					{ ! isFormValid( 'limit_per_user' ) && focusedLimitPerUser && (
						<FormInputValidation
							isError
							text={ translate( 'Please enter a positive value, or 0 for infinite uses.' ) }
						/>
					) }
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-coupon-boolean">
					<ToggleControl
						onChange={ ( newValue ) => setEditedCannotBeCombined( newValue ) }
						checked={ editedCannotBeCombined }
						label={ translate( 'Cannot be combined with other coupons' ) }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-coupon-boolean">
					<ToggleControl
						onChange={ ( newValue ) => setEditedFirstTimePurchaseOnly( newValue ) }
						checked={ editedFirstTimePurchaseOnly }
						label={ translate( 'Eligible for first-time order only' ) }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-duration">
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
						aria-label={ translate( 'Duration selection' ) }
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
				<FormFieldset className="memberships__dialog-sections-specific-emails">
					<ToggleControl
						onChange={ ( newValue ) => setEditedUseEmailAllowList( newValue ) }
						checked={ !! editedUseEmailAllowList }
						label={ translate( 'Limit coupon to specific emails' ) }
					/>
					<FormTextInput
						id="email_allow_list"
						value={ editedEmailAllowListCSV }
						onChange={ onEmailAllowListChange }
						disabled={ ! editedUseEmailAllowList }
						onBlur={ onEmailAllowListBlur }
						aria-label={ translate( 'Limit coupon to specific emails text input' ) }
					/>
					<FormSettingExplanation>
						{ translate(
							'Separate email addresses with commas. Use an asterisk (*) to match parts of an email. For example, "*@university.edu" would select all "university.edu" addresses.'
						) }
					</FormSettingExplanation>
					{ ! isFormValid( 'email_allow_list' ) && focusedEmailAllowList && (
						<FormInputValidation
							isError
							text={ translate( 'Please fix these invalid email addresses: %s', {
								args: invalidEditedEmailAllowListLabel ?? '',
							} ) }
						/>
					) }
				</FormFieldset>
			</div>
		</Dialog>
	);
};

export default RecurringPaymentsCouponAddEditModal;
