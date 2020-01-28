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
import { isCompleteAndValid } from '../types';

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
	StateSelect,
	renderDomainContactFields,
} ) {
	const translate = useTranslate();

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
					siteUrl={ siteUrl }
					isComplete={ false }
					isActive={ true }
					CountrySelectMenu={ CountrySelectMenu }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
					renderDomainContactFields={ renderDomainContactFields }
				/>
			),
			completeStepContent: <WPContactForm summary isComplete={ true } isActive={ false } />,
			isCompleteCallback: () => isCompleteAndValid( contactInfo ),
			isEditableCallback: () => isFormEditable( contactInfo ),
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

function isFormEditable( contactInfo ) {
	// If any field has been touched, it is editable
	return Object.values( contactInfo ).some( ( { isTouched } ) => isTouched );
}
