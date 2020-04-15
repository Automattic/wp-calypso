/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';
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
import { isCompleteAndValid } from '../types';
import { WPOrderReviewTotal, WPOrderReviewSection, LineItemUI } from './wp-order-review-line-items';

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
	CheckoutTerms,
	countriesList,
	StateSelect,
	renderDomainContactFields,
	variantRequestStatus,
	variantSelectOverride,
	getItemVariants,
	domainContactValidationCallback,
	responseCart,
	subtotal,
} ) {
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( submitCoupon );
	const total = useTotal();
	const activePaymentMethod = usePaymentMethod();

	const [ items ] = useLineItems();
	const firstDomainItem = items.find( isLineItemADomain );
	const domainName = firstDomainItem ? firstDomainItem.sublabel : siteUrl;
	const isDomainFieldsVisible = !! firstDomainItem;
	const shouldShowContactStep = isDomainFieldsVisible || total.amount.value > 0;

	const contactInfo = useSelect( sel => sel( 'wpcom' ).getContactInfo() ) || {};
	const { setSiteId, touchContactFields, applyDomainContactValidationResults } = useDispatch(
		'wpcom'
	);

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

		if ( isDomainFieldsVisible ) {
			const hasValidationErrors = await domainContactValidationCallback(
				activePaymentMethod.id,
				contactInfo,
				[ domainName ],
				applyDomainContactValidationResults
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
				completeStepContent={ <WPCheckoutOrderSummary siteUrl={ siteUrl } /> }
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
					stepId="review-order-step"
					isCompleteCallback={ () => true }
					activeStepContent={
						<WPCheckoutOrderReview
							removeItem={ removeItem }
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							removeCoupon={ removeCouponAndResetActiveStep }
							onChangePlanLength={ changePlanLength }
							variantRequestStatus={ variantRequestStatus }
							variantSelectOverride={ variantSelectOverride }
							getItemVariants={ getItemVariants }
						/>
					}
					titleContent={ <OrderReviewTitle /> }
					completeStepContent={ <InactiveOrderReview /> }
					editButtonText={ translate( 'Edit' ) }
					editButtonAriaLabel={ translate( 'Edit the payment method' ) }
					nextStepButtonText={ translate( 'Continue' ) }
					nextStepButtonAriaLabel={ translate( 'Continue with the selected payment method' ) }
					validatingButtonText={ translate( 'Please wait…' ) }
					validatingButtonAriaLabel={ translate( 'Please wait…' ) }
				/>
				{ shouldShowContactStep && (
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
					stepId="payment-method-step"
					activeStepContent={
						<PaymentMethodStep
							CheckoutTerms={ CheckoutTerms }
							responseCart={ responseCart }
							subtotal={ subtotal }
						/>
					}
					completeStepContent={ paymentMethodStep.completeStepContent }
					titleContent={ paymentMethodStep.titleContent }
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

function PaymentMethodStep( { CheckoutTerms, responseCart, subtotal } ) {
	const [ items, total ] = useLineItems();
	const taxes = items.filter( item => item.type === 'tax' );
	return (
		<React.Fragment>
			{ paymentMethodStep.activeStepContent }

			<CheckoutTermsUI>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsUI>

			<WPOrderReviewSection>
				{ subtotal && <LineItemUI subtotal item={ subtotal } /> }
				{ taxes.map( tax => (
					<LineItemUI tax key={ tax.id } item={ tax } />
				) ) }
				<WPOrderReviewTotal total={ total } />
			</WPOrderReviewSection>
		</React.Fragment>
	);
}

function InactiveOrderReview() {
	const [ items ] = useLineItems();
	return (
		<SummaryContent>
			<ProductList>
				{ items.filter( shouldItemBeInSummary ).map( product => {
					return <ProductListItem key={ product.id }>{ product.label }</ProductListItem>;
				} ) }
			</ProductList>
		</SummaryContent>
	);
}

function shouldItemBeInSummary( item ) {
	const itemTypesToIgnore = [ 'tax', 'credits', 'wordpress-com-credits' ];
	return ! itemTypesToIgnore.includes( item.type );
}

const CheckoutTermsUI = styled.div`
	& > * {
		margin: 16px 0 16px -24px;
		padding-left: 24px;
		position: relative;
	}

	& div:first-of-type {
		padding-left: 0;
		margin-left: 0;
		margin-top: 32px;
	}

	svg {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 0;
		left: 0;
	}

	p {
		font-size: 12px;
		margin: 0;
		word-break: break-word;
	}

	a {
		text-decoration: underline;
	}

	a:hover {
		text-decoration: none;
	}
`;

const SummaryContent = styled.div`
	margin-top: 12px;

	@media ( ${props => props.theme.breakpoints.smallPhoneUp} ) {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
	}
`;

const ProductList = styled.ul`
	margin: 0;
	padding: 0;
`;

const ProductListItem = styled.li`
	margin: 0;
	padding: 0;
	list-style-type: none;
`;
