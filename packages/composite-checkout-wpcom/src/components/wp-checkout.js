/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useIsStepComplete,
	useSelect,
	useLineItems,
	useDispatch,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { areDomainsInLineItems } from '../hooks/has-domains';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary, { WPCheckoutOrderSummaryTitle } from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const [ items ] = useLineItems();

	if ( areDomainsInLineItems( items ) ) {
		return ! isActive && isComplete
			? translate( 'Contact information' )
			: translate( 'Enter your contact information' );
	}
	return ! isActive && isComplete
		? translate( 'Billing information' )
		: translate( 'Enter your billing information' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Review your order' );
};

export default function WPCheckout( {
	removeItem,
	changePlanLength,
	siteId,
	siteUrl,
	CountrySelectMenu,
	countriesList,
	PhoneInput,
	StateSelect,
    renderDomainFields,
} ) {
	const translate = useTranslate();
	const [ itemsWithTax ] = useLineItems();

	const ReviewContent = () => (
		<WPCheckoutOrderReview
			removeItem={ removeItem }
			onChangePlanLength={ changePlanLength }
			siteUrl={ siteUrl }
		/>
	);

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const { setSiteId } = useDispatch( 'wpcom' );

	// Copy siteId to the store so it can be more easily accessed during payment submission
	useEffect( () => {
		setSiteId( siteId );
	}, [ siteId, setSiteId ] );

	const steps = [
		{
			id: 'order-summary',
			className: 'checkout__order-summary-step',
			hasStepNumber: false,
			titleContent: <WPCheckoutOrderSummaryTitle />,
			completeStepContent: <WPCheckoutOrderSummary siteUrl={ siteUrl } />,
			isCompleteCallback: () => true,
		},
		{
			...getDefaultPaymentMethodStep(),
			getEditButtonAriaLabel: () => translate( 'Edit the payment method' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the selected payment method' ),
		},
		{
			id: 'contact-form',
			className: 'checkout__billing-details-step',
			hasStepNumber: true,
			titleContent: <ContactFormTitle />,
			activeStepContent: (
				<WPContactForm
					isComplete={ false }
					isActive={ true }
					CountrySelectMenu={ CountrySelectMenu }
					countriesList={ countriesList }
					PhoneInput={ PhoneInput }
					StateSelect={ StateSelect }
					renderDomainFields={ renderDomainFields }
				/>
			),
			completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
			isCompleteCallback: () => isFormComplete( contactInfo, itemsWithTax ),
			isEditableCallback: () => isFormEditable( contactInfo, itemsWithTax ),
			getEditButtonAriaLabel: () => translate( 'Edit the billing details' ),
			getNextStepButtonAriaLabel: () => translate( 'Continue with the entered billing details' ),
		},
		{
			id: 'order-review',
			className: 'checkout__review-order-step',
			hasStepNumber: true,
			titleContent: <OrderReviewTitle />,
			activeStepContent: <ReviewContent />,
			isCompleteCallback: ( { activeStep } ) => {
				const isActive = activeStep.id === 'order-review';
				return isActive;
			},
		},
	];

	return <Checkout steps={ steps } />;
}

function isElligibleForVat() {
	//TODO: Detect whether people are in EU or AU and return true if they are
	return false;
}

function isFormComplete( contactInfo, items ) {
	const taxFields = [ contactInfo.country, contactInfo.postalCode ];
	const contactFields = [
		contactInfo.firstName,
		contactInfo.lastName,
		contactInfo.email,
		contactInfo.address,
		contactInfo.city,
		contactInfo.state,
		...( isElligibleForVat() ? [ contactInfo.vatId ] : [] ),
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems( items ) ) {
		allFields = allFields.concat( contactFields );
	}

	if ( ! allFields.every( field => field ) ) {
		return false;
	}

	// Make sure all required fields are filled
	return allFields.every( ( { isValid } ) => isValid );
}

function isFormEditable( contactInfo, items ) {
	const taxFields = [ contactInfo.country, contactInfo.postalCode ];
	const contactFields = [
		contactInfo.firstName,
		contactInfo.lastName,
		contactInfo.email,
		contactInfo.address,
		contactInfo.city,
		contactInfo.state,
		...( isElligibleForVat() ? [ contactInfo.vatId ] : [] ),
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems( items ) ) {
		allFields = allFields.concat( contactFields );
	}

	if ( ! allFields.every( field => field ) ) {
		return false;
	}

	// If any field has been touched, it is editable
	return allFields.some( ( { isTouched } ) => isTouched );
}
