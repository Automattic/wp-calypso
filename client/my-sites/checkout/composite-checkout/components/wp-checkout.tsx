/**
 * External dependencies
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslate } from 'i18n-calypso';
import {
	Checkout,
	CheckoutStep,
	CheckoutStepArea,
	CheckoutSteps,
	CheckoutStepBody,
	CheckoutSummaryArea as CheckoutSummaryAreaUnstyled,
	getDefaultPaymentMethodStep,
	useDispatch,
	useEvents,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	usePaymentMethod,
	useSelect,
	useTotal,
	CheckoutErrorBoundary,
} from '@automattic/composite-checkout';
import debugFactory from 'debug';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { RemoveProductFromCart, RequestCartProduct } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import useCouponFieldState from '../hooks/use-coupon-field-state';
import useUpdateCartLocationWhenPaymentMethodChanges from '../hooks/use-update-cart-location-when-payment-method-changes';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import WPContactFormSummary from './wp-contact-form-summary';
import { isCompleteAndValid } from '../types/wpcom-store-state';
import MaterialIcon from 'calypso/components/material-icon';
import Gridicon from 'calypso/components/gridicon';
import SecondaryCartPromotions from './secondary-cart-promotions';
import {
	handleContactValidationResult,
	isContactValidationResponseValid,
	getDomainValidationResult,
	getSignupEmailValidationResult,
	getGSuiteValidationResult,
} from 'calypso/my-sites/checkout/composite-checkout/contact-validation';
import { login } from 'calypso/lib/paths';
import config from '@automattic/calypso-config';
import getContactDetailsType from '../lib/get-contact-details-type';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
} from 'calypso/lib/cart-values/cart-items';
import QueryExperiments from 'calypso/components/data/query-experiments';
import PaymentMethodStep from './payment-method-step';
import CheckoutHelpLink from './checkout-help-link';
import styled from '../lib/styled';
import type { CountryListItem } from '../types/country-list-item';
import type { GetProductVariants } from '../hooks/product-variants';
import type { OnChangeItemVariant } from '../components/item-variation-picker';

const debug = debugFactory( 'calypso:composite-checkout:wp-checkout' );

// This will make converting to TS less noisy. The order of components can be reorganized later
/* eslint-disable @typescript-eslint/no-use-before-define */

const ContactFormTitle = (): JSX.Element => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const { responseCart } = useShoppingCart();
	const contactDetailsType = getContactDetailsType( responseCart );

	if ( contactDetailsType === 'domain' ) {
		return (
			<>
				{ ! isActive && isComplete
					? String( translate( 'Contact information' ) )
					: String( translate( 'Enter your contact information' ) ) }
			</>
		);
	}

	if ( contactDetailsType === 'gsuite' ) {
		return (
			<>
				{ ! isActive && isComplete
					? String(
							translate( '%(googleMailService)s account information', {
								args: {
									googleMailService: getGoogleMailServiceFamily(),
								},
								comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
							} )
					  )
					: String(
							translate( 'Enter your %(googleMailService)s account information', {
								args: {
									googleMailService: getGoogleMailServiceFamily(),
								},
								comment: '%(googleMailService)s can be either "G Suite" or "Google Workspace"',
							} )
					  ) }
			</>
		);
	}

	return (
		<>
			{ ! isActive && isComplete
				? String( translate( 'Billing information' ) )
				: String( translate( 'Enter your billing information' ) ) }
		</>
	);
};

const OrderReviewTitle = () => {
	const translate = useTranslate();
	return <>{ String( translate( 'Your order' ) ) }</>;
};

const paymentMethodStep = getDefaultPaymentMethodStep();

export default function WPCheckout( {
	removeProductFromCart,
	changePlanLength,
	siteId,
	siteUrl,
	countriesList,
	getItemVariants,
	addItemToCart,
	showErrorMessageBriefly,
	isLoggedOutCart,
	infoMessage,
	createUserAndSiteBeforeTransaction,
}: {
	removeProductFromCart: RemoveProductFromCart;
	changePlanLength: OnChangeItemVariant;
	siteId: number | undefined;
	siteUrl: string | undefined;
	countriesList: CountryListItem[];
	getItemVariants: GetProductVariants;
	addItemToCart: ( item: Partial< RequestCartProduct > ) => void;
	showErrorMessageBriefly: ( error: string ) => void;
	isLoggedOutCart: boolean;
	infoMessage?: JSX.Element;
	createUserAndSiteBeforeTransaction: boolean;
} ): JSX.Element {
	const {
		responseCart,
		applyCoupon,
		updateLocation,
		isPendingUpdate: isCartPendingUpdate,
	} = useShoppingCart();
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const total = useTotal();
	const activePaymentMethod = usePaymentMethod();
	const onEvent = useEvents();

	const areThereDomainProductsInCart =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const isGSuiteInCart = hasGoogleApps( responseCart );

	const contactDetailsType = getContactDetailsType( responseCart );

	const contactInfo: ManagedContactDetails =
		useSelect( ( sel ) => sel( 'wpcom' ).getContactInfo() ) || {};
	const { setSiteId, touchContactFields, applyDomainContactValidationResults } = useDispatch(
		'wpcom'
	);

	const [
		shouldShowContactDetailsValidationErrors,
		setShouldShowContactDetailsValidationErrors,
	] = useState( false );

	const emailTakenLoginRedirectMessage = ( emailAddress: string ) => {
		const redirectTo = '/checkout/no-site?cart=no-user';
		const isNative = config.isEnabled( 'login/native-login-links' );
		const loginUrl = login( { redirectTo, emailAddress, isNative } );

		return translate(
			'That email address is already in use. If you have an existing account, {{a}}please log in{{/a}}.',
			{
				components: {
					a: <a href={ loginUrl } />,
				},
			}
		);
	};

	const validateContactDetailsAndDisplayErrors = async () => {
		debug( 'validating contact details and reporting errors' );
		if ( isLoggedOutCart ) {
			const email = contactInfo.email?.value ?? '';
			const validationResult = await getSignupEmailValidationResult(
				email,
				emailTakenLoginRedirectMessage
			);
			handleContactValidationResult( {
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod?.id ?? '',
				validationResult,
				applyDomainContactValidationResults,
			} );
			const isSignupValidationValid = isContactValidationResponseValid(
				validationResult,
				contactInfo
			);

			if ( ! isSignupValidationValid ) {
				return false;
			}
		}

		if ( contactDetailsType === 'domain' ) {
			const validationResult = await getDomainValidationResult(
				responseCart.products,
				contactInfo
			);
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod?.id ?? '',
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( contactDetailsType === 'gsuite' ) {
			const validationResult = await getGSuiteValidationResult(
				responseCart.products,
				contactInfo
			);
			debug( 'validating contact details result', validationResult );
			handleContactValidationResult( {
				recordEvent: onEvent,
				showErrorMessage: showErrorMessageBriefly,
				paymentMethodId: activePaymentMethod?.id ?? '',
				validationResult,
				applyDomainContactValidationResults,
			} );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};
	const validateContactDetails = async () => {
		debug( 'validating contact details without reporting errors' );
		if ( isLoggedOutCart ) {
			const email = contactInfo.email?.value ?? '';
			const validationResult = await getSignupEmailValidationResult(
				email,
				emailTakenLoginRedirectMessage
			);
			const isSignupValidationValid = isContactValidationResponseValid(
				validationResult,
				contactInfo
			);

			if ( ! isSignupValidationValid ) {
				return false;
			}
		}

		if ( contactDetailsType === 'domain' ) {
			const validationResult = await getDomainValidationResult(
				responseCart.products,
				contactInfo
			);
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		} else if ( contactDetailsType === 'gsuite' ) {
			const validationResult = await getGSuiteValidationResult(
				responseCart.products,
				contactInfo
			);
			debug( 'validating contact details result', validationResult );
			return isContactValidationResponseValid( validationResult, contactInfo );
		}
		return isCompleteAndValid( contactInfo );
	};

	// The "Summary" view is displayed in the sidebar at desktop (wide) widths
	// and before the first step at mobile (smaller) widths. At smaller widths it
	// starts collapsed and can be expanded; at wider widths (as a sidebar) it is
	// always visible. It is not a step and its visibility is managed manually.
	const [ isSummaryVisible, setIsSummaryVisible ] = useState( false );

	// The "Order review" step is not managed by Composite Checkout and is shown/hidden manually.
	// If the page includes a 'order-review=true' query string, then start with
	// the order review step visible.
	const [ isOrderReviewActive, setIsOrderReviewActive ] = useState( () => {
		try {
			const shouldInitOrderReviewStepActive =
				window?.location?.search.includes( 'order-review=true' ) ?? false;
			if ( shouldInitOrderReviewStepActive ) {
				return true;
			}
		} catch ( error ) {
			// If there's a problem loading the query string, just default to false.
			debug(
				'Error loading query string to determine if we should see the order review step at load',
				error
			);
		}
		return false;
	} );

	const { formStatus } = useFormStatus();

	// Copy siteId to the store so it can be more easily accessed during payment submission
	useEffect( () => {
		setSiteId( siteId );
	}, [ siteId, setSiteId ] );

	const updateCartContactDetails = useCallback( () => {
		// Update tax location in cart
		const nonTaxPaymentMethods = [ 'free-purchase' ];
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

	const onSummaryError = useCallback(
		( error ) =>
			onEvent( {
				type: 'STEP_LOAD_ERROR',
				payload: {
					message: error,
					stepId: 'summary',
				},
			} ),
		[ onEvent ]
	);

	const validatingButtonText = isCartPendingUpdate
		? String( translate( 'Updating cart…' ) )
		: String( translate( 'Please wait…' ) );

	return (
		<Checkout>
			<QueryExperiments />
			<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
				<CheckoutErrorBoundary
					errorMessage={ translate( 'Sorry, there was an error loading this information.' ) }
					onError={ onSummaryError }
				>
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
						<WPCheckoutOrderSummary
							siteId={ siteId }
							onChangePlanLength={ changePlanLength }
							nextDomainIsFree={ responseCart?.next_domain_is_free }
						/>
						<SecondaryCartPromotions
							responseCart={ responseCart }
							addItemToCart={ addItemToCart }
						/>
						<CheckoutHelpLink />
					</CheckoutSummaryBody>
				</CheckoutErrorBoundary>
			</CheckoutSummaryArea>
			<CheckoutStepArea
				submitButtonHeader={ <SubmitButtonHeader /> }
				disableSubmitButton={ isOrderReviewActive }
			>
				{ infoMessage }
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
							removeProductFromCart={ removeProductFromCart }
							couponFieldStateProps={ couponFieldStateProps }
							onChangePlanLength={ changePlanLength }
							getItemVariants={ getItemVariants }
							siteUrl={ siteUrl }
							createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
						/>
					}
					titleContent={ <OrderReviewTitle /> }
					completeStepContent={
						<WPCheckoutOrderReview
							isSummary
							couponFieldStateProps={ couponFieldStateProps }
							siteUrl={ siteUrl }
						/>
					}
					editButtonText={ String( translate( 'Edit' ) ) }
					editButtonAriaLabel={ String( translate( 'Edit your order' ) ) }
					nextStepButtonText={ String( translate( 'Save order' ) ) }
					nextStepButtonAriaLabel={ String( translate( 'Save your order' ) ) }
					validatingButtonText={ validatingButtonText }
					validatingButtonAriaLabel={ validatingButtonText }
					formStatus={ formStatus }
				/>
				<CheckoutSteps areStepsActive={ ! isOrderReviewActive }>
					{ contactDetailsType !== 'none' && (
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
									countriesList={ countriesList }
									shouldShowContactDetailsValidationErrors={
										shouldShowContactDetailsValidationErrors
									}
									contactValidationCallback={ validateContactDetails }
									contactDetailsType={ contactDetailsType }
									isLoggedOutCart={ isLoggedOutCart }
								/>
							}
							completeStepContent={
								<WPContactFormSummary
									areThereDomainProductsInCart={ areThereDomainProductsInCart }
									isGSuiteInCart={ isGSuiteInCart }
									isLoggedOutCart={ isLoggedOutCart }
								/>
							}
							titleContent={ <ContactFormTitle /> }
							editButtonText={ String( translate( 'Edit' ) ) }
							editButtonAriaLabel={ String( translate( 'Edit the contact details' ) ) }
							nextStepButtonText={ String( translate( 'Continue' ) ) }
							nextStepButtonAriaLabel={ String(
								translate( 'Continue with the entered contact details' )
							) }
							validatingButtonText={ validatingButtonText }
							validatingButtonAriaLabel={ validatingButtonText }
						/>
					) }
					<CheckoutStep
						stepId="payment-method-step"
						activeStepContent={
							<PaymentMethodStep activeStepContent={ paymentMethodStep.activeStepContent } />
						}
						completeStepContent={ paymentMethodStep.completeStepContent }
						titleContent={ paymentMethodStep.titleContent }
						editButtonText={ String( translate( 'Edit' ) ) }
						editButtonAriaLabel={ String( translate( 'Edit the payment method' ) ) }
						nextStepButtonText={ String( translate( 'Continue' ) ) }
						nextStepButtonAriaLabel={ String(
							translate( 'Continue with the selected payment method' )
						) }
						validatingButtonText={ validatingButtonText }
						validatingButtonAriaLabel={ validatingButtonText }
						isCompleteCallback={ () => false }
					/>
				</CheckoutSteps>
			</CheckoutStepArea>
		</Checkout>
	);
}

const CheckoutSummaryArea = styled( CheckoutSummaryAreaUnstyled )`
	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		position: relative;
	}
`;

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
		max-width: 328px;
		position: fixed;
		width: 100%;
	}
`;

function SubmitButtonHeader() {
	const translate = useTranslate();

	const scrollToTOS = () => document?.getElementById( 'checkout-terms' )?.scrollIntoView();

	return (
		<SubmitButtonHeaderWrapper>
			{ translate( 'By continuing, you agree to our {{button}}Terms of Service{{/button}}.', {
				components: {
					button: <button onClick={ scrollToTOS } />,
				},
			} ) }
		</SubmitButtonHeaderWrapper>
	);
}

const SubmitButtonHeaderWrapper = styled.div`
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
