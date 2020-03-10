/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	CheckoutStepBody,
	CheckoutSteps,
	CheckoutStep,
	getDefaultPaymentMethodStep,
	useIsStepActive,
	useIsStepComplete,
	useSelect,
	useLineItems,
	useDispatch,
	useTotal,
	usePaymentMethod,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { areDomainsInLineItems, isLineItemADomain } from '../hooks/has-domains';
import useCouponFieldState from '../hooks/use-coupon-field-state';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary, { WPCheckoutOrderSummaryTitle } from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import { isCompleteAndValid, prepareDomainContactDetails } from '../types';

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

const paymentMethodStep = getDefaultPaymentMethodStep();

export default function WPCheckout( {
	removeItem,
	updateLocation,
	submitCoupon,
	removeCoupon,
	couponStatus,
	changePlanLength,
	siteId,
	siteUrl,
	CountrySelectMenu,
	countriesList,
	StateSelect,
	renderDomainContactFields,
	variantRequestStatus,
	variantSelectOverride,
	getItemVariants,
	domainContactValidationCallback,
} ) {
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( submitCoupon );
	const total = useTotal();
	const activePaymentMethod = usePaymentMethod();

	const [ items ] = useLineItems();
	const firstDomainItem = items.find( isLineItemADomain );
	const domainName = firstDomainItem ? firstDomainItem.sublabel : siteUrl;
	const shouldUseDomainContactValidationEndpoint = !! firstDomainItem;

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const {
		setSiteId,
		touchContactFields,
		updateContactDetails,
		updateCountryCode,
		updatePostalCode,
		applyDomainContactValidationResults,
	} = useDispatch( 'wpcom' );

	const [
		shouldShowContactDetailsValidationErrors,
		setShouldShowContactDetailsValidationErrors,
	] = useState( false );

	const contactValidationCallback = async () => {
		updateLocation( {
			countryCode: contactInfo.countryCode.value,
			postalCode: contactInfo.postalCode.value,
			subdivisionCode: contactInfo.state.value,
		} );
		// Touch the fields so they display validation errors
		touchContactFields();

		if ( shouldUseDomainContactValidationEndpoint ) {
			const hasValidationErrors = await domainContactValidationCallback(
				activePaymentMethod.id,
				prepareDomainContactDetails( contactInfo ),
				[ domainName ],
				applyDomainContactValidationResults,
				contactInfo
			);
			return ! hasValidationErrors;
		}

		return isCompleteAndValid( contactInfo );
	};

	// Copy siteId to the store so it can be more easily accessed during payment submission
	useEffect( () => {
		setSiteId( siteId );
	}, [ siteId, setSiteId ] );

	const removeCouponAndResetActiveStep = () => {
		removeCoupon();
		// Since the first step may now be invalid (eg: newly empty CC fields) we need to go back.
		setActiveStepNumber( 1 );
	};

	return (
		<Checkout>
			<CheckoutStepBody
				activeStepContent={ null }
				completeStepContent={
					<WPCheckoutOrderSummary
						siteUrl={ siteUrl }
						couponStatus={ couponStatus }
						couponFieldStateProps={ couponFieldStateProps }
					/>
				}
				titleContent={ <WPCheckoutOrderSummaryTitle /> }
				errorMessage={ translate( 'There was an error with the summary step.' ) }
				isStepActive={ false }
				isStepComplete={ true }
				stepNumber={ 1 }
				totalSteps={ 1 }
				stepId={ 'order-summary' }
			/>
			<CheckoutSteps>
				<CheckoutStep
					stepId="payment-method-step"
					isCompleteCallback={ () =>
						paymentMethodStep.isCompleteCallback( { activePaymentMethod } )
					}
					activeStepContent={ paymentMethodStep.activeStepContent }
					completeStepContent={ paymentMethodStep.completeStepContent }
					titleContent={ paymentMethodStep.titleContent }
					editButtonText={ translate( 'Edit' ) }
					editButtonAriaLabel={ translate( 'Edit the payment method' ) }
					nextStepButtonText={ translate( 'Continue' ) }
					nextStepButtonAriaLabel={ translate( 'Continue with the selected payment method' ) }
					validatingButtonText={ translate( 'Please wait…' ) }
					validatingButtonAriaLabel={ translate( 'Please wait…' ) }
				/>
				{ total.amount.value !== 0 && (
					<CheckoutStep
						stepId={ 'contact-form' }
						isCompleteCallback={ () => {
							setShouldShowContactDetailsValidationErrors( true );
							return contactValidationCallback();
						} }
						activeStepContent={
							<WPContactForm
								siteUrl={ siteUrl }
								isComplete={ false }
								isActive={ true }
								CountrySelectMenu={ CountrySelectMenu }
								countriesList={ countriesList }
								StateSelect={ StateSelect }
								renderDomainContactFields={ renderDomainContactFields }
								updateContactDetails={ updateContactDetails }
								updateCountryCode={ updateCountryCode }
								updatePostalCode={ updatePostalCode }
								shouldShowContactDetailsValidationErrors={
									shouldShowContactDetailsValidationErrors
								}
							/>
						}
						completeStepContent={ <WPContactForm summary isComplete={ true } isActive={ false } /> }
						titleContent={ <ContactFormTitle /> }
						editButtonText={ translate( 'Edit' ) }
						editButtonAriaLabel={ translate( 'Edit the contact details' ) }
						nextStepButtonText={ translate( 'Continue' ) }
						nextStepButtonAriaLabel={ translate( 'Continue with the entered contact details' ) }
						validatingButtonText={ translate( 'Please wait…' ) }
						validatingButtonAriaLabel={ translate( 'Please wait…' ) }
					/>
				) }
				<CheckoutStep
					stepId="review-order-step"
					isCompleteCallback={ () => true }
					activeStepContent={
						<WPCheckoutOrderReview
							removeItem={ removeItem }
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							removeCoupon={ removeCouponAndResetActiveStep }
							onChangePlanLength={ changePlanLength }
							siteUrl={ siteUrl }
							variantRequestStatus={ variantRequestStatus }
							variantSelectOverride={ variantSelectOverride }
							getItemVariants={ getItemVariants }
						/>
					}
					titleContent={ <OrderReviewTitle /> }
					editButtonText={ translate( 'Edit' ) }
					editButtonAriaLabel={ translate( 'Edit the payment method' ) }
					nextStepButtonText={ translate( 'Continue' ) }
					nextStepButtonAriaLabel={ translate( 'Continue with the selected payment method' ) }
					validatingButtonText={ translate( 'Please wait…' ) }
					validatingButtonAriaLabel={ translate( 'Please wait…' ) }
				/>
			</CheckoutSteps>
		</Checkout>
	);
}

function setActiveStepNumber( stepNumber ) {
	window.location.hash = '#step' + stepNumber;
}
