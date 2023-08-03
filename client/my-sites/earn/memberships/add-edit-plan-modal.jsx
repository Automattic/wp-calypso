import { Dialog, FormInputValidation } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import FoldableCard from 'calypso/components/foldable-card';
import CountedTextArea from 'calypso/components/forms/counted-textarea';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSectionHeading from 'calypso/components/forms/form-section-heading';
import FormSelect from 'calypso/components/forms/form-select';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestAddProduct,
	requestUpdateProduct,
} from 'calypso/state/memberships/product-list/actions';
import { getconnectedAccountDefaultCurrencyForSiteId } from 'calypso/state/memberships/settings/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Return the minimum transaction amount for a currency.
 * If the defaultCurrency is not the same as the current currency, return the double, in order to prevent issues with Stripe minimum amounts
 * See https://wp.me/p81Rsd-1hN
 *
 * @param {string} currency - Currency.
 * @param {string} connectedAccountDefaultCurrency - Default currency of the current account
 * @returns {number} Minimum transaction amount for given currency.
 */
function minimumCurrencyTransactionAmount(
	currency_min,
	currency,
	connectedAccountDefaultCurrency
) {
	if ( connectedAccountDefaultCurrency.toUpperCase() === currency.toUpperCase() ) {
		return currency_min[ currency ];
	}
	return currency_min[ currency ] * 2;
}

/**
 * @type {number}
 */
const MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE = 2000;

const RecurringPaymentsPlanAddEditModal = ( {
	addProduct,
	closeDialog,
	product,
	siteId,
	updateProduct,
	connectedAccountDefaultCurrency,
	connectedAccountMinimumCurrency,
} ) => {
	const currencyList = Object.keys( connectedAccountMinimumCurrency );
	const translate = useTranslate();
	const [ editedCustomConfirmationMessage, setEditedCustomConfirmationMessage ] = useState(
		product?.welcome_email_content ?? ''
	);
	const [ editedMultiplePerUser, setEditedMultiplePerUser ] = useState(
		product?.multiple_per_user ?? false
	);

	const [ editedMarkAsDonation, setEditedMarkAsDonation ] = useState( product?.type ?? null );

	const [ editedPayWhatYouWant, setEditedPayWhatYouWant ] = useState(
		product?.buyer_can_change_amount ?? false
	);

	const defaultCurrency = useMemo( () => {
		if ( product?.currency ) {
			return product?.currency;
		}
		// Return the Stripe currency if supported. Otherwise default to USD
		if ( currencyList.includes( connectedAccountDefaultCurrency ) ) {
			return connectedAccountDefaultCurrency;
		}
		return 'USD';
	}, [ currencyList, product ] );
	const [ currentCurrency, setCurrentCurrency ] = useState( defaultCurrency );

	const [ currentPrice, setCurrentPrice ] = useState(
		product?.price ??
			minimumCurrencyTransactionAmount(
				connectedAccountMinimumCurrency,
				currentCurrency,
				connectedAccountDefaultCurrency
			)
	);

	const [ editedProductName, setEditedProductName ] = useState( product?.title ?? '' );
	const [ editedPostsEmail, setEditedPostsEmail ] = useState(
		product?.subscribe_as_site_subscriber ?? false
	);
	const [ editedSchedule, setEditedSchedule ] = useState( product?.renewal_schedule ?? '1 month' );
	const [ focusedName, setFocusedName ] = useState( false );

	const [ editedPrice, setEditedPrice ] = useState( false );

	const isValidCurrencyAmount = ( currency, price ) =>
		price >=
		minimumCurrencyTransactionAmount(
			connectedAccountMinimumCurrency,
			currency,
			connectedAccountDefaultCurrency
		);

	const isFormValid = ( field ) => {
		if (
			( field === 'price' || ! field ) &&
			! isValidCurrencyAmount( currentCurrency, currentPrice )
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

	const handleCurrencyChange = ( event ) => {
		const { value: currency } = event.currentTarget;
		setCurrentCurrency( currency );
		setEditedPrice( true );
	};
	const handlePriceChange = ( event ) => {
		const value = parseFloat( event.currentTarget.value );
		// Set the current price if the value is a valid number or an empty string.
		if ( '' === event.currentTarget.value || ! isNaN( value ) ) {
			setCurrentPrice( event.currentTarget.value );
		}
		setEditedPrice( true );
	};
	const handlePayWhatYouWant = ( newValue ) => setEditedPayWhatYouWant( newValue );
	const handleMultiplePerUser = ( newValue ) => setEditedMultiplePerUser( newValue );
	const handleMarkAsDonation = ( newValue ) =>
		setEditedMarkAsDonation( true === newValue ? 'donation' : null );
	const onNameChange = ( event ) => setEditedProductName( event.target.value );
	const onSelectSchedule = ( event ) => setEditedSchedule( event.target.value );

	// Ideally these values should be kept in sync with the Jetpack equivalents,
	// though there's no strong technical reason to do so - nothing is going to
	// break if they fall out of sync.
	// https://github.com/Automattic/jetpack/blob/trunk/projects/plugins/jetpack/extensions/shared/components/product-management-controls/utils.js#L95
	const defaultNames = {
		'false,1 month': translate( 'Monthly Subscription' ),
		'true,1 month': translate( 'Monthly Donation' ),
		'false,1 year': translate( 'Yearly Subscription' ),
		'true,1 year': translate( 'Yearly Donation' ),
		'false,one-time': translate( 'Subscription' ),
		'true,one-time': translate( 'Donation' ),
	};

	useEffect( () => {
		// If the user has manually entered a name that should be left as-is, don't overwrite it
		if ( editedProductName && ! Object.values( defaultNames ).includes( editedProductName ) ) {
			return;
		}
		const name = defaultNames[ [ 'donation' === editedMarkAsDonation, editedSchedule ] ] ?? '';
		setEditedProductName( name );
	}, [ editedMarkAsDonation, editedSchedule ] );

	const onClose = ( reason ) => {
		if ( reason === 'submit' && ( ! product || ! product.ID ) ) {
			const product_details = {
				currency: currentCurrency,
				price: currentPrice,
				title: editedProductName,
				interval: editedSchedule,
				buyer_can_change_amount: editedPayWhatYouWant,
				multiple_per_user: editedMultiplePerUser,
				welcome_email_content: editedCustomConfirmationMessage,
				subscribe_as_site_subscriber: editedPostsEmail,
				type: editedMarkAsDonation,
				is_editable: true,
			};
			addProduct(
				siteId,
				product_details,
				translate( 'Added "%s" payment plan.', { args: editedProductName } )
			);
			recordTracksEvent( 'calypso_earn_page_payment_added', product_details );
		} else if ( reason === 'submit' && product && product.ID ) {
			const product_details = {
				ID: product.ID,
				currency: currentCurrency,
				price: currentPrice,
				title: editedProductName,
				interval: editedSchedule,
				buyer_can_change_amount: editedPayWhatYouWant,
				multiple_per_user: editedMultiplePerUser,
				welcome_email_content: editedCustomConfirmationMessage,
				subscribe_as_site_subscriber: editedPostsEmail,
				type: editedMarkAsDonation,
				is_editable: true,
			};
			updateProduct(
				siteId,
				product_details,
				translate( 'Updated "%s" payment plan.', { args: editedProductName } )
			);
			recordTracksEvent( 'calypso_earn_page_payment_updated', product_details );
		}
		closeDialog();
	};

	const addPlan = editedPostsEmail
		? translate( 'Set up newsletter payment options' )
		: translate( 'Set up payment options' );

	const editPlan = editedPostsEmail
		? translate( 'Edit newsletter payment options' )
		: translate( 'Edit payment options' );

	const editing = product && product.ID;

	recordTracksEvent( 'calypso_earn_page_payment_modal_show', { editing: editing } );

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
			<FormSectionHeading>{ editing ? editPlan : addPlan }</FormSectionHeading>
			<div className="memberships__dialog-sections">
				<FormFieldset>
					<FormLabel htmlFor="title">{ translate( 'Describe the offer' ) }</FormLabel>
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
				{ editing && editedPrice && (
					<Notice
						text={ translate(
							'Updating the price will not affect existing subscribers, who will pay what they were originally charged on renewal.'
						) }
						showDismiss={ false }
					/>
				) }
				{ ! isFormValid( 'price' ) && (
					<FormInputValidation
						isError
						text={ translate( 'Please enter a price higher than %s', {
							args: [
								formatCurrency(
									minimumCurrencyTransactionAmount(
										currentCurrency,
										connectedAccountDefaultCurrency
									),
									currentCurrency
								),
							],
						} ) }
					/>
				) }
				<FormFieldset className="memberships__dialog-sections-price">
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="renewal_schedule">{ translate( 'Renewal frequency' ) }</FormLabel>
						<FormSelect
							id="renewal_schedule"
							value={ editedSchedule }
							onChange={ onSelectSchedule }
						>
							<option value="1 month">{ translate( 'Monthly' ) }</option>
							<option value="1 year">{ translate( 'Yearly' ) }</option>
							<option value="one-time">{ translate( 'One time sale' ) }</option>
						</FormSelect>
					</div>
					<div className="memberships__dialog-sections-price-field-container">
						<FormLabel htmlFor="currency">{ translate( 'Amount' ) }</FormLabel>
						<FormCurrencyInput
							name="currency"
							id="currency"
							value={ currentPrice }
							onChange={ handlePriceChange }
							currencySymbolPrefix={ currentCurrency }
							onCurrencyChange={ handleCurrencyChange }
							currencyList={ currencyList.map( ( code ) => ( { code } ) ) }
							placeholder="0.00"
							noWrap
						/>
					</div>
				</FormFieldset>
				<FormFieldset>
					<ToggleControl
						onChange={ handleMarkAsDonation }
						checked={ 'donation' === editedMarkAsDonation }
						label={ translate( 'Mark this plan as a donation' ) }
					/>
					<ToggleControl
						onChange={ ( newValue ) => setEditedPostsEmail( newValue ) }
						checked={ editedPostsEmail }
						label={ translate( 'Paid newsletter subscription' ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLabel htmlFor="renewal_schedule">{ translate( 'Welcome message' ) }</FormLabel>
					<CountedTextArea
						value={ editedCustomConfirmationMessage }
						onChange={ ( event ) => setEditedCustomConfirmationMessage( event.target.value ) }
						acceptableLength={ MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE }
						showRemainingCharacters={ true }
						placeholder={ translate( 'Thank you for subscribing!' ) }
					/>
					<FormSettingExplanation>
						{ translate( 'The welcome message sent when your subscriber completes their order.' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FoldableCard
					header={ translate( 'Advanced options' ) }
					hideSummary
					className="memberships__dialog-advanced-options"
				>
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
			</div>
		</Dialog>
	);
};

export default connect(
	( state ) => ( {
		siteId: getSelectedSiteId( state ),
		connectedAccountDefaultCurrency: getconnectedAccountDefaultCurrencyForSiteId(
			state,
			getSelectedSiteId( state )
		),
	} ),
	{ addProduct: requestAddProduct, updateProduct: requestUpdateProduct }
)( RecurringPaymentsPlanAddEditModal );
