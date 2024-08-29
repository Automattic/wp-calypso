import { Dialog, FormInputValidation, FormLabel, FoldableCard } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState, useEffect, useMemo } from 'react';
import CountedTextArea from 'calypso/components/forms/counted-textarea';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import {
	PLAN_YEARLY_FREQUENCY,
	PLAN_MONTHLY_FREQUENCY,
	PLAN_ONE_TIME_FREQUENCY,
	TYPE_TIER,
} from 'calypso/my-sites/earn/memberships/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestAddProduct,
	requestAddTier,
	requestUpdateProduct,
	requestUpdateTier,
} from 'calypso/state/memberships/product-list/actions';
import {
	getconnectedAccountDefaultCurrencyForSiteId,
	getconnectedAccountMinimumCurrencyForSiteId,
} from 'calypso/state/memberships/settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { Product } from '../../types';
import './style.scss';

type RecurringPaymentsPlanAddEditModalProps = {
	closeDialog: () => void;
	product: Product;
	annualProduct: Product | null;
	siteId?: number;
	isOnlyTier?: boolean;
	hideWelcomeEmailInput?: boolean;
	hideAdvancedSettings?: boolean;
};

type StripeMinimumCurrencyAmounts = {
	[ key: string ]: number;
};

type DefaultNames = {
	// [ key: string ]: ( arg0: string ) => string;
	[ key: string ]: string;
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
	const currencyMin = currency_min?.[ currency ];
	if ( ! currencyMin ) {
		return 0;
	}

	if ( connectedAccountDefaultCurrency?.toUpperCase() === currency ) {
		return currencyMin;
	}
	return currencyMin * 2;
}

const MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE = 2000;

const RecurringPaymentsPlanAddEditModal = ( {
	closeDialog,
	product,
	annualProduct /* annual product for tiers */,
	siteId,
	isOnlyTier = false,
	hideWelcomeEmailInput = false,
	hideAdvancedSettings = false,
}: RecurringPaymentsPlanAddEditModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const connectedAccountDefaultCurrency = useSelector( ( state ) =>
		getconnectedAccountDefaultCurrencyForSiteId( state, siteId ?? selectedSiteId )
	);
	const connectedAccountMinimumCurrency = useSelector( ( state ) =>
		getconnectedAccountMinimumCurrencyForSiteId( state, siteId ?? selectedSiteId )
	);
	const [ editedCustomConfirmationMessage, setEditedCustomConfirmationMessage ] = useState(
		product?.welcome_email_content ?? ''
	);
	const [ editedMultiplePerUser, setEditedMultiplePerUser ] = useState(
		product?.multiple_per_user ?? false
	);

	const [ editedPayWhatYouWant, setEditedPayWhatYouWant ] = useState(
		product?.buyer_can_change_amount ?? false
	);

	const currencyList = Object.keys( connectedAccountMinimumCurrency ?? {} );

	const defaultCurrency = useMemo( () => {
		if ( product?.currency ) {
			return product?.currency;
		}
		// Return the Stripe currency if supported. Otherwise default to USD
		if ( currencyList.includes( connectedAccountDefaultCurrency ) ) {
			return connectedAccountDefaultCurrency;
		}
		return 'USD';
	}, [ product, connectedAccountDefaultCurrency ] );

	const [ currentCurrency, setCurrentCurrency ] = useState( defaultCurrency );

	const [ currentPrice, setCurrentPrice ] = useState(
		product?.price ??
			minimumCurrencyTransactionAmount(
				connectedAccountMinimumCurrency,
				currentCurrency,
				connectedAccountDefaultCurrency
			)
	);

	const [ currentAnnualPrice, setCurrentAnnualPrice ] = useState(
		annualProduct?.price ??
			12 *
				minimumCurrencyTransactionAmount(
					connectedAccountMinimumCurrency,
					currentCurrency,
					connectedAccountDefaultCurrency
				)
	);
	const [ editedProductName, setEditedProductName ] = useState( product?.title ?? '' );
	const [ editedPostPaidNewsletter, setEditedPostPaidNewsletter ] = useState(
		product?.subscribe_as_site_subscriber ?? false
	);

	const [ editedPostIsTier, setEditedPostIsTier ] = useState(
		product?.type === TYPE_TIER ?? false
	);
	const [ editedSchedule, setEditedSchedule ] = useState(
		product?.renewal_schedule ?? PLAN_MONTHLY_FREQUENCY
	);

	const [ focusedName, setFocusedName ] = useState( false );
	const [ nameWasEdited, setNameWasEdited ] = useState( false );

	const [ editedPrice, setEditedPrice ] = useState( false );

	const isValidCurrencyAmount = ( currency: string, price: number ) =>
		price >=
		minimumCurrencyTransactionAmount(
			connectedAccountMinimumCurrency,
			currency,
			connectedAccountDefaultCurrency
		);

	const isFormValid = ( field?: string ) => {
		if (
			( field === 'price' || ! field ) &&
			( ! isValidCurrencyAmount( currentCurrency, currentPrice ) ||
				( editedPostIsTier && ! isValidCurrencyAmount( currentCurrency, currentAnnualPrice ) ) )
		) {
			return false;
		}
		if (
			( field === 'prices' || ( editedPostIsTier && ! field ) ) &&
			currentPrice >= currentAnnualPrice
		) {
			return false;
		}
		if ( ( field === 'name' || ! field ) && editedProductName.length === 0 ) {
			return false;
		}
		if (
			! field &&
			editedCustomConfirmationMessage &&
			editedCustomConfirmationMessage.length > MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE
		) {
			return false;
		}
		return true;
	};

	const handleCurrencyChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		const { value: currency } = event.currentTarget;
		setCurrentCurrency( currency );
		setEditedPrice( true );
	};
	const handlePriceChange =
		( isAnnualProduct = false ) =>
		( event: ChangeEvent< HTMLInputElement > ) => {
			const value = parseFloat( event.currentTarget.value );
			// Set the current price if the value is a valid number or an empty string.
			if ( '' === event.currentTarget.value || ! isNaN( value ) ) {
				const newPrice = Number( event.currentTarget.value );
				isAnnualProduct ? setCurrentAnnualPrice( newPrice ) : setCurrentPrice( newPrice );
			}
			setEditedPrice( true );
		};
	const handlePayWhatYouWant = ( newValue: boolean ) => setEditedPayWhatYouWant( newValue );
	const handleMultiplePerUser = ( newValue: boolean ) => setEditedMultiplePerUser( newValue );
	const onNameChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		setNameWasEdited( true );
		setEditedProductName( event.target.value );
	};
	const onSelectSchedule = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedSchedule( event.target.value );

	// Ideally these values should be kept in sync with the Jetpack equivalents,
	// though there's no strong technical reason to do so - nothing is going to
	// break if they fall out of sync.
	// https://github.com/Automattic/jetpack/blob/trunk/projects/plugins/jetpack/extensions/shared/components/product-management-controls/utils.js#L95
	const defaultNames: DefaultNames = {};
	defaultNames[ PLAN_MONTHLY_FREQUENCY ] = translate( 'Monthly Subscription' );
	defaultNames[ PLAN_YEARLY_FREQUENCY ] = translate( 'Yearly Subscription' );
	defaultNames[ PLAN_ONE_TIME_FREQUENCY ] = translate( 'Subscription' );

	const defaultNameTier = translate( 'Newsletter Tier' );

	useEffect( () => {
		// If the user has manually entered a name that should be left as-is, don't overwrite it
		if (
			product.ID ||
			nameWasEdited ||
			( editedProductName && ! Object.values( defaultNames ).includes( editedProductName ) )
		) {
			return;
		}
		const name = editedPostIsTier ? defaultNameTier : defaultNames[ `${ editedSchedule }` ] ?? '';

		setEditedProductName( name );
	}, [ editedSchedule, editedPostIsTier, product, nameWasEdited ] );

	const getAnnualProductDetailsFromProduct = ( productDetails: Product ): Product => ( {
		...productDetails,
		ID: annualProduct?.ID, // will the the ID if already existing
		price: currentAnnualPrice,
		interval: PLAN_YEARLY_FREQUENCY,
		title: productDetails.title,
	} );

	const getCurrentProductDetails = (): Product => {
		const product: Product = {
			currency: currentCurrency,
			price: currentPrice,
			title: editedProductName,
			interval: editedSchedule,
			buyer_can_change_amount: editedPayWhatYouWant,
			multiple_per_user: editedMultiplePerUser,
			welcome_email_content: editedCustomConfirmationMessage,
			subscribe_as_site_subscriber: editedPostPaidNewsletter,
			is_editable: true,
		};

		if ( editedPostIsTier ) {
			product.type = TYPE_TIER;
		}

		return product;
	};

	const onClose = ( reason: string | undefined ) => {
		const productDetails = getCurrentProductDetails();

		if ( reason === 'submit' && ( ! product || ! product.ID ) ) {
			if ( editedPostIsTier ) {
				const annualProductDetails = getAnnualProductDetailsFromProduct( productDetails );
				dispatch(
					requestAddTier(
						siteId ?? selectedSiteId,
						productDetails,
						annualProductDetails,
						translate( 'Added "%s" tier payment plan.', { args: editedProductName } )
					)
				);
				recordTracksEvent( 'calypso_earn_page_payment_added', productDetails );
				recordTracksEvent( 'calypso_earn_page_payment_added', annualProductDetails );
			} else {
				dispatch(
					requestAddProduct(
						siteId ?? selectedSiteId,
						productDetails,
						translate( 'Added "%s" payment plan.', { args: editedProductName } )
					)
				);
				recordTracksEvent( 'calypso_earn_page_payment_added', productDetails );
			}
		} else if ( reason === 'submit' && product && product.ID ) {
			productDetails.ID = product.ID;

			if ( editedPostIsTier ) {
				const annualProductDetails = getAnnualProductDetailsFromProduct( productDetails );
				dispatch(
					requestUpdateTier(
						siteId ?? selectedSiteId,
						productDetails,
						annualProductDetails,
						translate( 'Updated "%s" tier payment plan.', { args: editedProductName } )
					)
				);
			} else {
				dispatch(
					requestUpdateProduct(
						siteId ?? selectedSiteId,
						productDetails,
						translate( 'Updated "%s" payment plan.', { args: editedProductName } )
					)
				);
			}
		}
		closeDialog();
	};

	const addPlan = editedPostIsTier
		? translate( 'Set up newsletter tier options' )
		: translate( 'Set up plan options' );

	const editPlan = editedPostIsTier
		? translate( 'Edit newsletter tier options' )
		: translate( 'Edit plan options' );

	const editing = product && product.ID;

	recordTracksEvent( 'calypso_earn_page_payment_modal_show', { editing: editing } );

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
			<FormSectionHeading>{ editing ? editPlan : addPlan }</FormSectionHeading>
			<div className="memberships__dialog-sections">
				<FormFieldset>
					<FormLabel htmlFor="title">
						{ editedPostIsTier
							? translate( 'Describe the tier name' )
							: translate( 'Describe the plan' ) }
					</FormLabel>
					<FormTextInput
						id="title"
						value={ editedProductName }
						onChange={ onNameChange }
						onBlur={ () => setFocusedName( true ) }
					/>
					<FormSettingExplanation>
						{ translate( "Let your audience know what they'll get when they subscribe." ) }
					</FormSettingExplanation>
					{ ! isFormValid( 'name' ) && focusedName && (
						<FormInputValidation isError text={ translate( 'Please input a name.' ) } />
					) }
				</FormFieldset>
				{ ! isOnlyTier && (
					<FormFieldset className="memberships__dialog-sections-type">
						<ToggleControl
							onChange={ ( newValue ) => {
								setEditedPostIsTier( newValue );
								setEditedPostPaidNewsletter( newValue );
							} }
							checked={ editedPostIsTier }
							disabled={ !! product.ID }
							label={ translate( 'Paid newsletter tier' ) }
						/>
					</FormFieldset>
				) }
				{ isOnlyTier && <input type="hidden" name="type" value={ TYPE_TIER } /> }
				{ editing && editedPrice && (
					<Notice
						text={ translate(
							'Updating the price will not affect existing subscribers, who will pay what they were originally charged on renewal.'
						) }
						showDismiss={ false }
					/>
				) }
				{ /* Price settings for a tier plan */ }
				{ editedPostIsTier && (
					<>
						<FormFieldset className="memberships__dialog-sections-price">
							<div className="memberships__dialog-sections-price-field-container">
								<FormLabel htmlFor="currency_monthly">{ translate( 'Monthly Price' ) }</FormLabel>
								<FormCurrencyInput
									name="currency_monthly"
									id="currency_monthly"
									value={ currentPrice }
									onChange={ handlePriceChange( false ) }
									currencySymbolPrefix={ currentCurrency }
									onCurrencyChange={ handleCurrencyChange }
									currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
									placeholder="0.00"
									noWrap
									className={ null }
									currencySymbolSuffix={ null }
								/>
							</div>
							<div className="memberships__dialog-sections-price-field-container">
								<FormLabel htmlFor="currency_annual">{ translate( 'Annual Price' ) }</FormLabel>
								<FormCurrencyInput
									name="currency_annual"
									id="currency_annual"
									value={ currentAnnualPrice }
									onChange={ handlePriceChange( true ) }
									currencySymbolPrefix={ currentCurrency }
									onCurrencyChange={ handleCurrencyChange }
									currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
									placeholder="0.00"
									noWrap
									className={ null }
									currencySymbolSuffix={ null }
								/>
							</div>
						</FormFieldset>
					</>
				) }

				{ /* Price settings for a regular plan */ }
				{ ! editedPostIsTier && (
					<FormFieldset className="memberships__dialog-sections-price">
						<div className="memberships__dialog-sections-price-field-container">
							<FormLabel htmlFor="renewal_schedule">{ translate( 'Renewal frequency' ) }</FormLabel>
							<FormSelect
								id="renewal_schedule"
								value={ editedSchedule }
								onChange={ onSelectSchedule }
							>
								<option value={ PLAN_MONTHLY_FREQUENCY }>{ translate( 'Monthly' ) }</option>
								<option value={ PLAN_YEARLY_FREQUENCY }>{ translate( 'Yearly' ) }</option>
								<option value={ PLAN_ONE_TIME_FREQUENCY }>{ translate( 'One time sale' ) }</option>
							</FormSelect>
						</div>
						<div className="memberships__dialog-sections-price-field-container">
							<FormLabel htmlFor="currency">{ translate( 'Amount' ) }</FormLabel>
							<FormCurrencyInput
								name="currency"
								id="currency"
								value={ currentPrice }
								onChange={ handlePriceChange( false ) }
								currencySymbolPrefix={ currentCurrency }
								onCurrencyChange={ handleCurrencyChange }
								currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
								placeholder="0.00"
								noWrap
								className={ null }
								currencySymbolSuffix={ null }
							/>
						</div>
					</FormFieldset>
				) }

				{ /* Error fields */ }
				{ ! isFormValid( 'price' ) && (
					<FormInputValidation
						isError
						text={ translate( 'Please enter a price higher than %s', {
							args: [
								formatCurrency(
									minimumCurrencyTransactionAmount(
										connectedAccountMinimumCurrency,
										currentCurrency,
										connectedAccountDefaultCurrency
									),
									currentCurrency
								),
							],
						} ) }
					/>
				) }
				{ editedPostIsTier && ! isFormValid( 'prices' ) && (
					<FormInputValidation
						isError
						text={ translate( 'Please enter a annual price higher than the monthly price', {
							args: [
								formatCurrency(
									minimumCurrencyTransactionAmount(
										connectedAccountMinimumCurrency,
										currentCurrency,
										connectedAccountDefaultCurrency
									),
									currentCurrency
								),
							],
						} ) }
					/>
				) }

				{ ! hideWelcomeEmailInput && (
					<FormFieldset className="memberships__dialog-sections-message">
						<FormLabel htmlFor="renewal_schedule">{ translate( 'Welcome message' ) }</FormLabel>
						<CountedTextArea
							value={ editedCustomConfirmationMessage }
							onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) =>
								setEditedCustomConfirmationMessage( event.target.value )
							}
							acceptableLength={ MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE }
							showRemainingCharacters
							placeholder={ translate( 'Thank you for subscribing!' ) }
						/>
						<FormSettingExplanation>
							{ translate( 'The welcome message sent when your customer completes their order.' ) }
						</FormSettingExplanation>
					</FormFieldset>
				) }
				{ ! hideAdvancedSettings && (
					<FoldableCard
						header={ translate( 'Advanced options' ) }
						hideSummary
						className="memberships__dialog-advanced-options"
					>
						{ ! editedPostIsTier && (
							<FormFieldset className="memberships__dialog-sections-type">
								<ToggleControl
									onChange={ ( newValue ) => {
										setEditedPostPaidNewsletter( newValue );
									} }
									checked={ editedPostPaidNewsletter }
									disabled={ !! product.ID || editedPostIsTier }
									label={ translate( 'Add customers to newsletter mailing list' ) }
								/>
							</FormFieldset>
						) }
						<FormFieldset>
							<ToggleControl
								onChange={ handlePayWhatYouWant }
								checked={ editedPayWhatYouWant }
								label={ translate(
									'Enable customers to pick their own amount (“Pay what you want”)'
								) }
							/>
							<ToggleControl
								onChange={ handleMultiplePerUser }
								checked={ editedMultiplePerUser }
								label={ translate( 'Enable customers to make the same purchase multiple times' ) }
							/>
						</FormFieldset>
					</FoldableCard>
				) }
			</div>
		</Dialog>
	);
};

export default RecurringPaymentsPlanAddEditModal;
