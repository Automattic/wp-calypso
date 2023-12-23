import { Dialog, FormInputValidation, FormLabel } from '@automattic/components';
import { formatCurrency } from '@automattic/format-currency';
import { MenuGroup, MenuItem, ToggleControl, ToolbarDropdownMenu } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { check, close, update } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { ChangeEvent, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { useSelector } from 'calypso/state';
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
	COUPON_PRODUCTS_ANY,
	COUPON_RANDOM_GENERATOR_CHARSET,
	COUPON_RANDOM_GENERATOR_LENGTH,
} from '../../memberships/constants';
import { Product, Coupon } from '../../types';
import FormTextInputWithRandomCodeGeneration from '../form-text-input-with-value-generation';
import './style.scss';

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
	const dispatch = useDispatch();

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

	/** Other datasets */
	const products: Product[] = useSelector( ( state ) =>
		getProductsForSiteId( state, selectedSiteId )
	);
	const coupons: Coupon[] = useSelector( ( state ) =>
		getCouponsForSiteId( state, selectedSiteId )
	);

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

	/** Product functions */
	const getProductDescription = ( product: Product ): string => {
		const { currency, renewal_schedule, price } = product;
		const amount = formatCurrency( parseFloat( price ), currency );
		switch ( renewal_schedule ) {
			case '1 month':
				return sprintf(
					// translators: %s: amount
					__( '%s / month', 'calypso' ),
					amount
				);
			case '1 year':
				return sprintf(
					// translators: %s: amount
					__( '%s / year', 'calypso' ),
					amount
				);
			case 'one-time':
				return amount;
		}
		return sprintf(
			// translators: %s: amount, plan interval
			__( '%1$s / %2$s', 'calypso' ),
			amount,
			renewal_schedule
		);
	};

	/** Form event handlers */
	const onCouponCodeChange = ( value: string, event: ChangeEvent< HTMLInputElement > ) =>
		setEditedCouponCode( event.target.value );
	const onCouponCodeRandomize = () => {
		const code = generateRandomCouponCode();
		setEditedCouponCode( code );
	};
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
	const onSelectProduct = ( event ) => {
		const productId = event.target.value ?? event.target.parentElement.value;
		if ( COUPON_PRODUCTS_ANY === productId ) {
			setEditedProducts( [] );
			return;
		}
		if ( editedProducts.includes( productId ) ) {
			setEditedProducts(
				editedProducts.filter( ( selectedId: string ) => selectedId !== productId )
			);
			return;
		}
		setEditedProducts( [ ...editedProducts, productId ] );
	};
	const onUsageLimitChange = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedUsageLimit( event.target.value );
	const onUsageLimitBlur = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedUsageLimit( parseInt( event.target.value ) > 0 ? parseInt( event.target.value ) : 0 );
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
		return true;
	};

	/** Dialog operations */
	const onClose = ( reason: string | undefined ) => {
		const couponDetails: Coupon = {
			coupon_code: editedCouponCode,
			description: editedDescription,
			discount_type: editedDiscountType,
			discount_value: editedDiscountAmount,
			discount_percentage: editedDiscountAmount, //TODO: divide amount into value and percentage vars
			discount_currency: currentDiscountCurrency,
			start_date: editedStartDate,
			end_date: editedEndDate,
			product_ids: editedProducts,
			can_be_combined: editedCanBeCombined,
			first_time_only: editedFirstTimeOnly,
			use_duration: editedUseDuration,
			duration: editedDuration,
			use_specific_emails: editedUseSpecificEmails,
			specific_emails: editedSpecificEmails,
		};

		if ( reason === 'submit' && ( ! coupon || ! coupon.ID ) ) {
			dispatch(
				requestAddCoupon(
					siteId ?? selectedSiteId,
					couponDetails,
					translate( 'Added coupon "%s".', { args: editedCouponCode } )
				)
			);
		} else if ( reason === 'submit' && coupon && coupon.ID ) {
			dispatch(
				requestUpdateCoupon(
					siteId ?? selectedSiteId,
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
	const selectedProductSummary = ( ( quantity: number ) => {
		if ( quantity > 1 ) {
			// translators: the %s is a number representing the number of products which are currently selected
			return sprintf( __( '%s products selected.' ), quantity );
		}
		if ( quantity === 1 ) {
			return __( '1 product selected' );
		}
		return translate( 'Any product' );
	} )( editedProducts.length );

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
					<FormTextInputWithRandomCodeGeneration
						id="coupon_code"
						value={ editedCouponCode }
						action="Random"
						onChange={ onCouponCodeChange }
						onAction={ onCouponCodeRandomize }
						isError={ ! isFormValid( 'coupon_code' ) }
						isValid={ isFormValid( 'coupon_code' ) }
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
								suffix="%"
								onChange={ onDiscountAmountChange }
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
						/>
					</div>
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="amount">{ translate( 'Expiration date (optional)' ) }</FormLabel>
						<FormTextInput
							id="end_date"
							type="date"
							value={ editedEndDate }
							onChange={ onEndDateChange }
						/>
					</div>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="coupon_code">{ translate( 'Products' ) }</FormLabel>
					<ToolbarDropdownMenu
						icon={ update }
						text={ selectedProductSummary }
						label="Select a product"
						role="button"
					>
						{ ( { onClose } ) => (
							<>
								<MenuGroup>
									<MenuItem
										value={ COUPON_PRODUCTS_ANY }
										onClick={ onSelectProduct }
										onClose={ onClose }
										isSelected={ editedProducts.length === 0 }
										icon={ editedProducts.length === 0 ? check : null }
										key={ COUPON_PRODUCTS_ANY }
										role="menuitemcheckbox"
									>
										{ translate( 'Any product' ) }
									</MenuItem>
								</MenuGroup>
								<MenuGroup>
									{ products &&
										products.map( function ( currentProduct: Product ) {
											const isSelected =
												editedProducts.length === 0 ||
												editedProducts.includes( '' + currentProduct.ID );
											const itemIcon = isSelected ? check : null;
											return (
												<MenuItem
													value={ currentProduct.ID }
													onClick={ onSelectProduct }
													onClose={ onClose }
													isSelected={ isSelected }
													icon={ itemIcon }
													key={ currentProduct.ID }
													role="menuitemcheckbox"
												>
													{ currentProduct.title } :
													{ ' ' + getProductDescription( currentProduct ) }
												</MenuItem>
											);
										} ) }
								</MenuGroup>
								<MenuGroup>
									<MenuItem
										value={ COUPON_PRODUCTS_ANY }
										onClick={ onClose }
										icon={ close }
										key={ COUPON_PRODUCTS_ANY }
										role="menuitemcheckbox"
									>
										{ translate( 'Close' ) }
									</MenuItem>
								</MenuGroup>
							</>
						) }
					</ToolbarDropdownMenu>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="coupon_code">{ translate( 'Usage limit (optional)' ) }</FormLabel>
					<FormTextInputWithAffixes
						id="usage_limit"
						suffix="times"
						value={ editedUsageLimit === 0 ? '∞' : editedUsageLimit }
						onChange={ onUsageLimitChange }
						onBlur={ onUsageLimitBlur }
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
