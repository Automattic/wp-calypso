import { Dialog, FormInputValidation } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState, useEffect, useMemo } from 'react';
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
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	requestAddProduct,
	requestUpdateProduct,
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
	siteId?: number;
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
 *
 * @param {StripeMinimumCurrencyAmounts} currency_min - Minimum transaction amount for each currency.
 * @param {string} currency - Currency.
 * @param {string} connectedAccountDefaultCurrency - Default currency of the current account
 * @returns {number} Minimum transaction amount for given currency.
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

const MAX_LENGTH_CUSTOM_CONFIRMATION_EMAIL_MESSAGE = 2000;

const RecurringPaymentsPlanAddEditModal = ( {
	closeDialog,
	product,
	siteId,
}: RecurringPaymentsPlanAddEditModalProps ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
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

	const currencyList = Object.keys( connectedAccountMinimumCurrency );

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

	const [ editedProductName, setEditedProductName ] = useState( product?.title ?? '' );
	const [ editedPostsEmail, setEditedPostsEmail ] = useState(
		product?.subscribe_as_site_subscriber ?? false
	);
	const [ editedSchedule, setEditedSchedule ] = useState( product?.renewal_schedule ?? '1 month' );
	const [ focusedName, setFocusedName ] = useState( false );

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

	const handleCurrencyChange = ( event: ChangeEvent< HTMLSelectElement > ) => {
		const { value: currency } = event.currentTarget;
		setCurrentCurrency( currency );
		setEditedPrice( true );
	};
	const handlePriceChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const value = parseFloat( event.currentTarget.value );
		// Set the current price if the value is a valid number or an empty string.
		if ( '' === event.currentTarget.value || ! isNaN( value ) ) {
			setCurrentPrice( Number( event.currentTarget.value ) );
		}
		setEditedPrice( true );
	};
	const handlePayWhatYouWant = ( newValue: boolean ) => setEditedPayWhatYouWant( newValue );
	const handleMultiplePerUser = ( newValue: boolean ) => setEditedMultiplePerUser( newValue );
	const onNameChange = ( event: ChangeEvent< HTMLInputElement > ) =>
		setEditedProductName( event.target.value );
	const onSelectSchedule = ( event: ChangeEvent< HTMLSelectElement > ) =>
		setEditedSchedule( event.target.value );

	// Ideally these values should be kept in sync with the Jetpack equivalents,
	// though there's no strong technical reason to do so - nothing is going to
	// break if they fall out of sync.
	// https://github.com/Automattic/jetpack/blob/trunk/projects/plugins/jetpack/extensions/shared/components/product-management-controls/utils.js#L95
	const defaultNames: DefaultNames = {
		'1 month': translate( 'Monthly Subscription' ),
		'1 year': translate( 'Yearly Subscription' ),
		'one-time': translate( 'Subscription' ),
	};

	useEffect( () => {
		// If the user has manually entered a name that should be left as-is, don't overwrite it
		if ( editedProductName && ! Object.values( defaultNames ).includes( editedProductName ) ) {
			return;
		}
		const name = defaultNames[ `${ editedSchedule }` ] ?? '';

		setEditedProductName( name );
	}, [ editedSchedule ] );

	const onClose = ( reason: string | undefined ) => {
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
				is_editable: true,
			};
			dispatch(
				requestAddProduct(
					siteId ?? selectedSiteId,
					product_details,
					translate( 'Added "%s" payment plan.', { args: editedProductName } )
				)
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
				is_editable: true,
			};
			dispatch(
				requestUpdateProduct(
					siteId ?? selectedSiteId,
					product_details,
					translate( 'Updated "%s" payment plan.', { args: editedProductName } )
				)
			);
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
							className={ null }
							currencySymbolSuffix={ null }
						/>
					</div>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-type">
					<ToggleControl
						onChange={ ( newValue ) => setEditedPostsEmail( newValue ) }
						checked={ editedPostsEmail }
						label={ translate( 'Paid newsletter subscription' ) }
					/>
				</FormFieldset>
				<FormFieldset className="memberships__dialog-sections-message">
					<FormLabel htmlFor="renewal_schedule">{ translate( 'Welcome message' ) }</FormLabel>
					<CountedTextArea
						value={ editedCustomConfirmationMessage }
						onChange={ ( event: ChangeEvent< HTMLTextAreaElement > ) =>
							setEditedCustomConfirmationMessage( event.target.value )
						}
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

export default RecurringPaymentsPlanAddEditModal;
