/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	getDefaultPaymentMethodStep,
	useIsStepActive,
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
	return isActive ? translate( 'Billing details' ) : translate( 'Enter your billing details' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Review your order' );
};

export default function WPCheckout( { removeItem, changePlanLength, siteId } ) {
	const translate = useTranslate();
	const [ itemsWithTax ] = useLineItems();

	const ReviewContent = () => (
		<WPCheckoutOrderReview removeItem={ removeItem } onChangePlanLength={ changePlanLength } />
	);

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const domainContactInfo = useSelect( sel => sel( 'wpcom' ).getDomainContactInfo() ) || {};
	const isDomainContactSame = useSelect( sel => sel( 'wpcom' ).isDomainContactSame() ) || false;
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
			completeStepContent: <WPCheckoutOrderSummary />,
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
			activeStepContent: <WPContactForm isComplete={ false } isActive={ true } />,
			completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
			isCompleteCallback: () =>
				isFormComplete( contactInfo, domainContactInfo, isDomainContactSame, itemsWithTax ),
			isEditableCallback: () =>
				isFormEditable( contactInfo, domainContactInfo, isDomainContactSame, itemsWithTax ),
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

function isFormComplete( contactInfo, domainContactInfo, isDomainContactSame, items ) {
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
	const domainFields = [
		domainContactInfo.firstName,
		domainContactInfo.lastName,
		domainContactInfo.email,
		domainContactInfo.address,
		domainContactInfo.city,
		domainContactInfo.state,
		domainContactInfo.phoneNumber,
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems( items ) ) {
		allFields = allFields.concat( contactFields );
		if ( ! isDomainContactSame ) {
			allFields = allFields.concat( domainFields );
		}
	}

	if ( ! allFields.every( field => field ) ) {
		return false;
	}

	// Make sure all required fields are filled
	return allFields.every( ( { isValid } ) => isValid );
}

function isFormEditable( contactInfo, domainContactInfo, isDomainContactSame, items ) {
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
	const domainFields = [
		domainContactInfo.firstName,
		domainContactInfo.lastName,
		domainContactInfo.email,
		domainContactInfo.address,
		domainContactInfo.city,
		domainContactInfo.state,
		domainContactInfo.phoneNumber,
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems( items ) ) {
		allFields = allFields.concat( contactFields );
		if ( ! isDomainContactSame ) {
			allFields = allFields.concat( domainFields );
		}
	}

	if ( ! allFields.every( field => field ) ) {
		return false;
	}

	// If any field has been touched, it is editable
	return allFields.some( ( { isTouched } ) => isTouched );
}
