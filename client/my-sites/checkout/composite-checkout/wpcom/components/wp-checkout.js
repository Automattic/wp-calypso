/**
 * External dependencies
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import styled from '@emotion/styled';
import {
	Checkout,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutSteps,
	CheckoutStepBody,
	CheckoutSummaryArea,
	getDefaultPaymentMethodStep,
	useDispatch,
	useEvents,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useLineItems,
	usePaymentMethod,
	useSelect,
	useTotal,
} from '@automattic/composite-checkout';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import { areDomainsInLineItems, isLineItemADomain } from '../hooks/has-domains';
import useCouponFieldState from '../hooks/use-coupon-field-state';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import { isCompleteAndValid } from '../types';
import { WPOrderReviewTotal, WPOrderReviewSection, LineItemUI } from './wp-order-review-line-items';
import MaterialIcon from 'components/material-icon';
import Gridicon from 'components/gridicon';
import SecondaryCartPromotions from './secondary-cart-promotions';
import {
	handleContactValidationResult,
	isContactValidationResponseValid,
	getDomainValidationResult,
	getGSuiteValidationResult,
} from 'my-sites/checkout/composite-checkout/contact-validation';
import { isGSuiteProductSlug } from 'lib/gsuite';

const debug = debugFactory( 'calypso:composite-checkout:wp-checkout' );

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const [ items ] = useLineItems();
	const isGSuiteInCart = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);

	if ( areDomainsInLineItems( items ) ) {
		return ! isActive && isComplete
			? translate( 'Contact information' )
			: translate( 'Enter your contact information' );
	}
	if ( isGSuiteInCart ) {
		return ! isActive && isComplete
			? translate( 'G Suite account information' )
			: translate( 'Enter your G Suite account information' );
	}
	return ! isActive && isComplete
		? translate( 'Billing information' )
		: translate( 'Enter your billing information' );
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return translate( 'Your order' );
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
	CheckoutTerms,
	countriesList,
	StateSelect,
	renderDomainContactFields,
	variantSelectOverride,
	getItemVariants,
	responseCart,
	addItemToCart,
	subtotal,
	isCartPendingUpdate,
	showErrorMessageBriefly,
	infoMessage,
} ) {
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( submitCoupon );
	const total = useTotal();
	const activePaymentMethod = usePaymentMethod();
	const onEvent = useEvents();

	const [ items ] = useLineItems();
	const firstDomainItem = items.find( isLineItemADomain );
	const isDomainFieldsVisible = !! firstDomainItem;
	const isGSuiteInCart = items.some( ( item ) =>
		isGSuiteProductSlug( item.wpcom_meta?.product_slug )
	);
	const shouldShowContactStep = isDomainFieldsVisible || total.amount.value > 0;

	const contactInfo = useSelect( ( sel ) => sel( 'wpcom' ).getContactInfo() ) || {};
	const { setSiteId, touchContactFields, applyDomainContactValidationResults } = useDispatch(
		'wpcom'
	);

	const [
		shouldShowContactDetailsValidationErrors,
		setShouldShowContactDetailsValidationErrors,
	] = useState( false );

	const validateContactDetailsAndDisplayErrors = async () => {
		debug( 'validating contact details with side effects' );
		if ( isDomainFieldsVisible ) {
			const validationResult = await getDomainValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod.id,
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( isGSuiteInCart ) {
			const validationResult = await getGSuiteValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod.id,
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};
	const validateContactDetails = async () => {
		debug( 'validating contact details' );
		if ( isDomainFieldsVisible ) {
			const validationResult = await getDomainValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( isGSuiteInCart ) {
			const validationResult = await getGSuiteValidationResult( items, contactInfo );
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};

	const [ isSummaryVisible, setIsSummaryVisible ] = useState( false );

	const [ isOrderReviewActive, setIsOrderReviewActive ] = useState( false );
	const { formStatus } = useFormStatus();

	// Copy siteId to the store so it can be more easily accessed during payment submission
	useEffect( () => {
		setSiteId( siteId );
	}, [ siteId, setSiteId ] );

	const updateCartContactDetails = useCallback( () => {
		// Update tax location in cart
		const nonTaxPaymentMethods = [ 'full-credits', 'free-purchase' ];
		if ( ! activePaymentMethod || ! contactInfo ) {
			return;
		}
		if ( nonTaxPaymentMethods.includes( activePaymentMethod.id ) ) {
			// this data is intentionally empty so we do not charge taxes
			updateLocation( {
				countryCode: '',
				postalCode: '',
				subdivisionCode: '',
			} );
		} else {
			updateLocation( {
				countryCode: contactInfo.countryCode?.value ?? '',
				postalCode: contactInfo.postalCode?.value ?? '',
				subdivisionCode: contactInfo.state?.value ?? '',
			} );
		}
	}, [ activePaymentMethod, updateLocation, contactInfo ] );

	useUpdateCartLocationWhenPaymentMethodChanges( activePaymentMethod, updateCartContactDetails );

	const onReviewError = useCallback(
		( error ) =>
			onEvent( {
				type: 'STEP_LOAD_ERROR',
				payload: {
					message: error,
					stepId: 'review',
				},
			} ),
		[ onEvent ]
	);

	return (
		<Checkout>
			<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
				<CheckoutSummaryTitleLink onClick={ () => setIsSummaryVisible( ! isSummaryVisible ) }>
					<CheckoutSummaryTitle>
						<CheckoutSummaryTitleIcon icon="info-outline" size={ 20 } />
						{ translate( 'Purchase Details' ) }
						<CheckoutSummaryTitleToggle icon="keyboard_arrow_down" />
					</CheckoutSummaryTitle>
					<CheckoutSummaryTitlePrice className="wp-checkout__total-price">
						{ total.amount.displayValue }
					</CheckoutSummaryTitlePrice>
				</CheckoutSummaryTitleLink>
				<CheckoutSummaryBody>
					<WPCheckoutOrderSummary />
					<SecondaryCartPromotions responseCart={ responseCart } addItemToCart={ addItemToCart } />
				</CheckoutSummaryBody>
			</CheckoutSummaryArea>
			<CheckoutStepArea submitButtonHeader={ <SubmitButtonHeader /> }>
				{ infoMessage && (
					<CheckoutNoticeWrapper>
						<Notice status="is-info" showDismiss={ false }>
							{ infoMessage }
						</Notice>
					</CheckoutNoticeWrapper>
				) }
				<CheckoutStepBody
					onError={ onReviewError }
					className="wp-checkout__review-order-step"
					stepId="review-order-step"
					isStepActive={ isOrderReviewActive }
					isStepComplete={ true }
					goToThisStep={ () => setIsOrderReviewActive( ! isOrderReviewActive ) }
					goToNextStep={ () => setIsOrderReviewActive( ! isOrderReviewActive ) }
					activeStepContent={
						<WPCheckoutOrderReview
							removeItem={ removeItem }
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							removeCoupon={ removeCoupon }
							onChangePlanLength={ changePlanLength }
							variantSelectOverride={ variantSelectOverride }
							getItemVariants={ getItemVariants }
							siteUrl={ siteUrl }
						/>
					}
					titleContent={ <OrderReviewTitle /> }
					completeStepContent={
						<WPCheckoutOrderReview
							isSummary
							couponStatus={ couponStatus }
							couponFieldStateProps={ couponFieldStateProps }
							siteUrl={ siteUrl }
						/>
					}
					editButtonText={ translate( 'Edit' ) }
					editButtonAriaLabel={ translate( 'Edit your order' ) }
					nextStepButtonText={ translate( 'Save order' ) }
					nextStepButtonAriaLabel={ translate( 'Save your order' ) }
					validatingButtonText={
						isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
					}
					validatingButtonAriaLabel={
						isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
					}
					formStatus={ formStatus }
				/>
				<CheckoutSteps areStepsActive={ ! isOrderReviewActive }>
					{ shouldShowContactStep && (
						<CheckoutStep
							stepId={ 'contact-form' }
							isCompleteCallback={ () => {
								setShouldShowContactDetailsValidationErrors( true );
								// Touch the fields so they display validation errors
								touchContactFields();
								updateCartContactDetails();

								return validateContactDetailsAndDisplayErrors();
							} }
							activeStepContent={
								<WPContactForm
									siteUrl={ siteUrl }
									isComplete={ false }
									isActive={ true }
									countriesList={ countriesList }
									StateSelect={ StateSelect }
									renderDomainContactFields={ renderDomainContactFields }
									shouldShowContactDetailsValidationErrors={
										shouldShowContactDetailsValidationErrors
									}
									contactValidationCallback={ validateContactDetails }
								/>
							}
							completeStepContent={
								<WPContactForm summary isComplete={ true } isActive={ false } />
							}
							titleContent={ <ContactFormTitle /> }
							editButtonText={ translate( 'Edit' ) }
							editButtonAriaLabel={ translate( 'Edit the contact details' ) }
							nextStepButtonText={ translate( 'Continue' ) }
							nextStepButtonAriaLabel={ translate( 'Continue with the entered contact details' ) }
							validatingButtonText={
								isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
							}
							validatingButtonAriaLabel={
								isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
							}
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
						validatingButtonText={
							isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
						}
						validatingButtonAriaLabel={
							isCartPendingUpdate ? translate( 'Updating cart…' ) : translate( 'Please wait…' )
						}
					/>
				</CheckoutSteps>
			</CheckoutStepArea>
		</Checkout>
	);
}

const CheckoutSummaryTitleLink = styled.button`
	background: ${ ( props ) => props.theme.colors.background };
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.textColor };
	display: flex;
	font-size: 16px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	justify-content: space-between;
	padding: 20px 23px 20px 14px;
	width: 100%;

	.rtl & {
		padding: 20px 14px 20px 23px;
	}

	.is-visible & {
		border-bottom: none;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-bottom: none 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: none;
	}
`;

const CheckoutSummaryTitle = styled.span`
	display: flex;
`;

const CheckoutSummaryTitleIcon = styled( Gridicon )`
	margin-right: 4px;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
	}
`;

const CheckoutSummaryTitleToggle = styled( MaterialIcon )`
	fill: ${ ( props ) => props.theme.colors.textColor };
	margin-left: 4px;
	transition: transform 0.1s linear;
	width: 18px;
	height: 18px;
	vertical-align: bottom;

	.rtl & {
		margin-right: 0;
		margin-left: 4px;
	}

	.is-visible & {
		transform: rotate( 180deg );
	}
`;

const CheckoutSummaryTitlePrice = styled.span`
	.is-visible & {
		display: none;
	}
`;

const CheckoutSummaryBody = styled.div`
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	display: none;

	.is-visible & {
		display: block;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border-bottom: none;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: block;
	}
`;

function PaymentMethodStep( { CheckoutTerms, responseCart, subtotal } ) {
	const [ items, total ] = useLineItems();
	const taxes = items.filter( ( item ) => item.type === 'tax' );
	return (
		<>
			{ paymentMethodStep.activeStepContent }

			<CheckoutTermsUI>
				<CheckoutTerms cart={ responseCart } />
			</CheckoutTermsUI>

			<WPOrderReviewSection>
				{ subtotal && <LineItemUI subtotal item={ subtotal } /> }
				{ taxes.map( ( tax ) => (
					<LineItemUI tax key={ tax.id } item={ tax } />
				) ) }
				<WPOrderReviewTotal total={ total } />
			</WPOrderReviewSection>
		</>
	);
}

const CheckoutTermsUI = styled.div`
	& > * {
		margin: 16px 0 16px -24px;
		padding-left: 24px;
		position: relative;
	}

	.rtl & > * {
		margin: 16px -24px 16px 0;
		padding-right: 24px;
		padding-left: 0;
	}

	& div:first-of-type {
		padding-right: 0;
		padding-left: 0;
		margin-right: 0;
		margin-left: 0;
		margin-top: 32px;
	}

	svg {
		width: 16px;
		height: 16px;
		position: absolute;
		top: 0;
		left: 0;

		.rtl & {
			left: auto;
			right: 0;
		}
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

function useUpdateCartLocationWhenPaymentMethodChanges(
	activePaymentMethod,
	updateCartContactDetails
) {
	const previousPaymentMethodId = useRef();
	const hasInitialized = useRef( false );
	useEffect( () => {
		if ( activePaymentMethod?.id && activePaymentMethod.id !== previousPaymentMethodId.current ) {
			previousPaymentMethodId.current = activePaymentMethod.id;
			if ( hasInitialized.current ) {
				updateCartContactDetails();
			}
			hasInitialized.current = true;
		}
	}, [ activePaymentMethod, updateCartContactDetails ] );
}

function SubmitButtonHeader() {
	const translate = useTranslate();

	const scrollToTOS = () => document.getElementById( 'checkout-terms' ).scrollIntoView();

	return (
		<SubmitButtonHeaderUI>
			{ translate( 'By continuing, you agree to our {{button}}Terms of Service{{/button}}.', {
				components: {
					button: <button onClick={ scrollToTOS } />,
				},
			} ) }
		</SubmitButtonHeaderUI>
	);
}

const SubmitButtonHeaderUI = styled.div`
	display: none;
	font-size: 13px;
	margin-top: -5px;
	margin-bottom: 10px;
	text-align: center;

	.checkout__step-wrapper--last-step & {
		display: block;

		@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
			display: none;
		}
	}

	button {
		color: ${ ( props ) => props.theme.colors.highlight };
		display: inline;
		font-size: 13px;
		text-decoration: underline;
		width: auto;

		&:hover {
			color: ${ ( props ) => props.theme.colors.highlightOver };
		}
	}
`;

const CheckoutNoticeWrapper = styled.div`
	padding: 32px 32px 20px;

	border-bottom: solid 1px var( --color-border-subtle );

	.notice {
		margin-bottom: 0;
	}

	.notice.is-info .notice__icon-wrapper-drop {
		background-color: var( --color-accent-40 );
	}

	.notice__text .checkout__duplicate-notice-link {
		margin-left: 20px;

		color: var( --color-neutral-10 );

		text-decoration: none;

		&:visited {
			color: var( --color-neutral-10 );
		}
	}
`;
