/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useSelect,
	useLineItems,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { areDomainsInLineItems } from '../hooks/has-domains';
import { OrderReview } from './order-review';
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

export function WPCheckout( { deleteItem, changePlanLength } ) {
	const translate = useTranslate();
	const [ itemsWithTax, total ] = useLineItems();

	const ReviewContent = () => (
		<OrderReview
			items={ itemsWithTax }
			total={ total }
			onDeleteItem={ deleteItem }
			onChangePlanLength={ changePlanLength }
		/>
	);

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const domainContactInfo = useSelect( sel => sel( 'wpcom' ).getDomainContactInfo() ) || {};
	const isDomainContactSame = useSelect( sel => sel( 'wpcom' ).isDomainContactSame() ) || false;

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
				isFormComplete( contactInfo, domainContactInfo, isDomainContactSame ),
			isEditableCallback: () => true,
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

function isFormComplete( contactInfo, domainContactInfo, isDomainContactSame ) {
	const taxFields = [ contactInfo.country, contactInfo.postalCode ];
	const contactFields = [
		contactInfo.firstName,
		contactInfo.lastName,
		contactInfo.email,
		contactInfo.address,
		contactInfo.city,
		contactInfo.state || contactInfo.province,
		contactInfo.vatId,
	];
	const domainFields = [
		domainContactInfo.firstName,
		domainContactInfo.lastName,
		domainContactInfo.email,
		domainContactInfo.address,
		domainContactInfo.city,
		domainContactInfo.state || domainContactInfo.province,
		domainContactInfo.phoneNumber,
	];
	let allFields = taxFields;
	if ( areDomainsInLineItems ) {
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
