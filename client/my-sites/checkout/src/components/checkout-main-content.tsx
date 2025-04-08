import {
	isYearly,
	isJetpackPurchasableItem,
	isMonthlyProduct,
	isBiennially,
	isTriennially,
} from '@automattic/calypso-products';
import { Gridicon, MaterialIcon } from '@automattic/components';
import {
	Button,
	CheckoutStep,
	CheckoutStepGroup,
	CheckoutStepBody,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	CheckoutErrorBoundary,
	CheckoutFormSubmit,
	PaymentMethodStep,
	FormStatus,
	usePaymentMethod,
	useTransactionStatus,
	TransactionStatus,
} from '@automattic/composite-checkout';
import { Step } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	styled,
	joinClasses,
	getContactDetailsType,
	ContactDetailsType,
} from '@automattic/wpcom-checkout';
import { css, keyframes } from '@emotion/react';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { formatCurrency, useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import Loading from 'calypso/components/loading';
import { shouldUseStepContainerV2 } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
	hasDIFMProduct,
	has100YearPlan as cartHas100YearPlan,
	ObjectWithProducts,
	hasPlan,
} from 'calypso/lib/cart-values/cart-items';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import isJetpackCheckout from 'calypso/lib/jetpack/is-jetpack-checkout';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { usePresalesChat } from 'calypso/lib/presales-chat';
import { areVatDetailsSame } from 'calypso/me/purchases/vat-info/are-vat-details-same';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import { CheckoutOrderBanner } from 'calypso/my-sites/checkout/src/components/checkout-order-banner';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/src/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import { prepareDomainContactValidationRequest } from 'calypso/my-sites/checkout/src/types/wpcom-store-state';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import SitePreview from 'calypso/my-sites/customer-home/cards/features/site-preview';
import useOneDollarOfferTrack from 'calypso/my-sites/plans/hooks/use-onedollar-offer-track';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import { getSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { getWpComDomainBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { useUpdateCachedContactDetails } from '../hooks/use-cached-contact-details';
import { useCheckoutHelpCenter } from '../hooks/use-checkout-help-center';
import useCouponFieldState from '../hooks/use-coupon-field-state';
import { validateContactDetails } from '../lib/contact-validation';
import { updateCartContactDetailsForCheckout } from '../lib/update-cart-contact-details-for-checkout';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import { CheckoutMoneyBackGuarantee } from './CheckoutMoneyBackGuarantee';
import AcceptTermsOfServiceCheckbox from './accept-terms-of-service-checkbox';
import badge14Src from './assets/icons/badge-14.svg';
import badge7Src from './assets/icons/badge-7.svg';
import badgeGenericSrc from './assets/icons/badge-generic.svg';
import badgeSecurity from './assets/icons/security.svg';
import CheckoutNextSteps from './checkout-next-steps';
import { CheckoutSidebarPlanUpsell } from './checkout-sidebar-plan-upsell';
import { EmptyCart, shouldShowEmptyCartPage } from './empty-cart';
import { GoogleDomainsCopy } from './google-transfers-copy';
import JetpackAkismetCheckoutSidebarPlanUpsell from './jetpack-akismet-checkout-sidebar-plan-upsell';
import { LeaveCheckoutModal, useCheckoutLeaveModal } from './leave-checkout-modal';
import BeforeSubmitCheckoutHeader from './payment-method-step';
import SecondaryCartPromotions from './secondary-cart-promotions';
import WPCheckoutOrderReview, { CouponFieldArea } from './wp-checkout-order-review';
import {
	LoadingCheckoutSummaryFeaturesList,
	WPCheckoutOrderSummary,
} from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import WPContactFormSummary from './wp-contact-form-summary';
import type { OnChangeItemVariant } from './item-variation-picker';
import type {
	CheckoutPageErrorCallback,
	StepChangedCallback,
	PaymentMethod,
} from '@automattic/composite-checkout';
import type {
	RemoveProductFromCart,
	MinimalRequestCartProduct,
	ResponseCart,
} from '@automattic/shopping-cart';
import type { CountryListItem } from '@automattic/wpcom-checkout';
import type { PropsWithChildren, ReactNode } from 'react';

const debug = debugFactory( 'calypso:wp-checkout' );

// This will make converting to TS less noisy. The order of components can be reorganized later
/* eslint-disable @typescript-eslint/no-use-before-define */
const LoadingSidebar = styled.div`
	display: none;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: block;
		box-sizing: border-box;
		max-width: 288px;
		margin-top: 46px;
	}
`;

const pulse = keyframes`
	0% { opacity: 1; }

	70% { opacity: 0.25; }

	100% { opacity: 1; }
`;

const LoadingFooter = styled.div`
	margin-top: 20px;
	padding-top: 20px;
	display: flex;
	justify-content: space-between;
	border-top: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
`;

interface LoadingContainerProps {
	width?: string;
	height?: string;
}

const SideBarLoadingCopy = styled.div< LoadingContainerProps >`
	font-size: 14px;
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 0;
	animation: ${ pulse } 1.5s ease-in-out infinite;
	width: ${ ( props ) => props.width ?? 'inherit' };
	height: ${ ( props ) => props.height ?? '16px' };
`;

const ContactDetailsFormDescription = styled.p`
	font-size: 14px;
	color: ${ ( props ) => props.theme.colors.textColor };
	margin: 0 0 16px;
`;

function ConditionalContactDetailsMessage( {
	contactDetailsType,
}: {
	contactDetailsType: ContactDetailsType;
} ) {
	const translate = useTranslate();
	return contactDetailsType === 'domain' ? (
		<ContactDetailsFormDescription>
			{ translate(
				'Registering a domain name requires valid contact information. Privacy Protection is included for all eligible domains to protect your personal information.'
			) }
		</ContactDetailsFormDescription>
	) : null;
}

function LoadingSidebarContent() {
	return (
		<LoadingSidebar>
			<SideBarLoadingCopy />
			<LoadingCheckoutSummaryFeaturesList />
			<LoadingFooter>
				<SideBarLoadingCopy width="50px" />
				<SideBarLoadingCopy width="75px" />
			</LoadingFooter>
			<LoadingFooter>
				<SideBarLoadingCopy height="30px" width="75px" />
				<SideBarLoadingCopy height="30px" width="125px" />
			</LoadingFooter>
		</LoadingSidebar>
	);
}

const ContactFormTitle = () => {
	const translate = useTranslate();
	const isActive = useIsStepActive();
	const isComplete = useIsStepComplete();
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
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

const getPresalesChatKey = ( responseCart: ObjectWithProducts ) => {
	const hasCartJetpackProductsOnly =
		responseCart?.products?.length > 0 &&
		responseCart?.products?.every( ( product ) =>
			isJetpackPurchasableItem( product.product_slug )
		);

	if ( isAkismetCheckout() ) {
		return 'akismet';
	} else if ( isJetpackCheckout() || hasCartJetpackProductsOnly ) {
		return 'jpCheckout';
	}

	return 'wpcom';
};

/* Include a condition for your use case here if you want to show a specific nudge in the checkout sidebar */
function CheckoutSidebarNudge( {
	addItemToCart,
	areThereDomainProductsInCart,
}: {
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	areThereDomainProductsInCart: boolean;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const isWcMobile = isWcMobileApp();
	const isDIFMInCart = hasDIFMProduct( responseCart );
	const hasMonthlyProduct = responseCart?.products?.some( isMonthlyProduct );
	const isPurchaseRenewal = responseCart?.products?.some?.( ( product ) => product.is_renewal );
	const selectedSite = useSelector( ( state ) => getSelectedSite( state ) );

	const domainWithoutPlanInCartOrSite =
		areThereDomainProductsInCart && ! hasPlan( responseCart ) && ! siteHasPaidPlan( selectedSite );

	const productsWithVariants = responseCart?.products?.filter(
		( product ) => product.product_variants?.length > 1 && product.is_domain_registration === false
	);

	if ( isWcMobile ) {
		return null;
	}

	if ( isDIFMInCart ) {
		return (
			<CheckoutSidebarNudgeWrapper>
				<CheckoutNextSteps responseCart={ responseCart } />
			</CheckoutSidebarNudgeWrapper>
		);
	}

	/**
	 * TODO !hasMonthlyProduct can likely be removed after Jetpack refactors their sidebar nudge
	 * to account for monthly products like CheckoutSidebarPlanUpsell does
	 */

	return (
		<CheckoutSidebarNudgeWrapper>
			{ ! ( productsWithVariants.length > 1 ) && (
				<>
					<CheckoutSidebarPlanUpsell />
					{ ! hasMonthlyProduct && <JetpackAkismetCheckoutSidebarPlanUpsell /> }
				</>
			) }
			{ ( isPurchaseRenewal || domainWithoutPlanInCartOrSite ) && (
				<SecondaryCartPromotions
					responseCart={ responseCart }
					addItemToCart={ addItemToCart }
					isPurchaseRenewal={ isPurchaseRenewal }
				/>
			) }
		</CheckoutSidebarNudgeWrapper>
	);
}

export default function CheckoutMainContent( {
	addItemToCart,
	changeSelection,
	countriesList,
	createUserAndSiteBeforeTransaction,
	infoMessage,
	isLoggedOutCart,
	onPageLoadError,
	paymentMethods,
	removeProductFromCart,
	showErrorMessageBriefly,
	siteId,
	siteUrl,
	isRemovingProductFromCart,
	areThereErrors,
	isInitialCartLoading,
	customizedPreviousPath,
	loadingHeader,
	onStepChanged,
	showSitePreview = false,
}: {
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	changeSelection: OnChangeItemVariant;
	onStepChanged?: StepChangedCallback;
	countriesList: CountryListItem[];
	createUserAndSiteBeforeTransaction: boolean;
	infoMessage?: JSX.Element;
	isLoggedOutCart: boolean;
	onPageLoadError: CheckoutPageErrorCallback;
	paymentMethods: PaymentMethod[];
	removeProductFromCart: RemoveProductFromCart;
	showErrorMessageBriefly: ( error: string ) => void;
	siteId: number | undefined;
	siteUrl: string | undefined;
	isRemovingProductFromCart: boolean;
	areThereErrors: boolean;
	isInitialCartLoading: boolean;
	customizedPreviousPath?: string;
	loadingHeader?: ReactNode;
	showSitePreview?: boolean;
} ) {
	const translate = useTranslate();
	const cartKey = useCartKey();
	const {
		responseCart,
		applyCoupon,
		updateLocation,
		replaceProductInCart,
		isPendingUpdate: isCartPendingUpdate,
		removeCoupon,
		couponStatus,
	} = useShoppingCart( cartKey );

	const leaveModalProps = useCheckoutLeaveModal( { siteUrl: siteUrl ?? '' } );

	const searchParams = new URLSearchParams( window.location.search );
	const isDIFMInCart = hasDIFMProduct( responseCart );
	const isSignupCheckout = searchParams.get( 'signup' ) === '1';
	const selectedSiteData = useSelector( getSelectedSite );
	const wpcomDomain = useSelector( ( state ) =>
		getWpComDomainBySiteId( state, selectedSiteData?.ID )
	);

	// Only show the site preview for WPCOM domains that have a site connected to the site id
	const shouldShowSitePreview =
		showSitePreview && selectedSiteData && wpcomDomain && ! isSignupCheckout && ! isDIFMInCart;

	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const reduxDispatch = useReduxDispatch();

	const isPresalesChatEnabled =
		! useSelector( getIsOnboardingAffiliateFlow ) && responseCart?.products?.length > 0;
	usePresalesChat( getPresalesChatKey( responseCart ), isPresalesChatEnabled );

	const hasCartJetpackProductsOnly = responseCart?.products?.every( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);
	const areThereDomainProductsInCart =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const isGSuiteInCart = hasGoogleApps( responseCart );

	const contactDetailsType = getContactDetailsType( responseCart );

	const contactInfo = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );

	const vatDetailsInForm = useSelect( ( select ) => select( CHECKOUT_STORE ).getVatDetails(), [] );
	const { setVatDetails, vatDetails: vatDetailsFromServer } = useVatDetails();

	const checkoutActions = useDispatch( CHECKOUT_STORE );

	const [ shouldShowContactDetailsValidationErrors, setShouldShowContactDetailsValidationErrors ] =
		useState( true );

	// The "Summary" view is displayed in the sidebar at desktop (wide) widths
	// and before the first step at mobile (smaller) widths. At smaller widths it
	// starts collapsed and can be expanded; at wider widths (as a sidebar) it is
	// always visible. It is not a step and its visibility is managed manually.
	const [ isSummaryVisible, setIsSummaryVisible ] = useState( false );
	const { formStatus } = useFormStatus();
	const isLoading = formStatus === FormStatus.LOADING;

	const onReviewError = useCallback(
		( error: Error ) =>
			onPageLoadError( 'step_load', error, {
				step_id: 'review',
			} ),
		[ onPageLoadError ]
	);

	const onSummaryError = useCallback(
		( error: Error ) =>
			onPageLoadError( 'step_load', error, {
				step_id: 'summary',
			} ),
		[ onPageLoadError ]
	);

	const validatingButtonText = isCartPendingUpdate
		? String( translate( 'Updating cart…' ) )
		: String( translate( 'Please wait…' ) );

	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl );
	const previousPath = useSelector( getPreviousRoute );
	const goToPreviousPage = () =>
		leaveCheckout( {
			siteSlug: siteUrl,
			forceCheckoutBackUrl,
			previousPath: customizedPreviousPath || previousPath,
			tracksEvent: 'calypso_checkout_composite_empty_cart_clicked',
		} );

	const { transactionStatus } = useTransactionStatus();
	const paymentMethod = usePaymentMethod();

	const hasMarketplaceProduct =
		useDoesCartHaveMarketplaceProductRequiringConfirmation( responseCart );

	const has100YearPlan = cartHas100YearPlan( responseCart );

	const [ is3PDAccountConsentAccepted, setIs3PDAccountConsentAccepted ] = useState( false );
	const [ is100YearPlanTermsAccepted, setIs100YearPlanTermsAccepted ] = useState( false );
	const [ isSubmitted, setIsSubmitted ] = useState( false );
	const [ isCouponFieldVisible, setCouponFieldVisible ] = useState( false );

	const isPurchaseFree = responseCart.total_cost_integer === 0;

	const removeCouponAndClearField = () => {
		couponFieldStateProps.setCouponFieldValue( '' );
		setCouponFieldVisible( false );
		return removeCoupon();
	};

	const updateCachedContactDetails = useUpdateCachedContactDetails();

	const validateForm = async () => {
		setIsSubmitted( true );
		if ( hasMarketplaceProduct && ! is3PDAccountConsentAccepted ) {
			return false;
		}

		if ( has100YearPlan && ! is100YearPlanTermsAccepted ) {
			return false;
		}
		return true;
	};

	useOneDollarOfferTrack( siteId, 'checkout' );

	const isStepContainerV2 = shouldUseStepContainerV2( getSignupCompleteFlowName() );
	const isLargeViewport = useViewportMatch( 'large', '>=' );

	const { helpCenterButtonCopy, helpCenterButtonLink, toggleHelpCenter } = useCheckoutHelpCenter();

	if ( ! checkoutActions ) {
		return null;
	}

	const {
		touchContactFields,
		applyDomainContactValidationResults,
		clearDomainContactErrorMessages,
	} = checkoutActions;

	if ( transactionStatus === TransactionStatus.COMPLETE ) {
		const headingText = translate( "Almost there – we're currently finalizing your order." );

		if ( isStepContainerV2 ) {
			return (
				<>
					<PerformanceTrackerStop />
					<Step.Loading title={ headingText } />
				</>
			);
		}

		return (
			<WPCheckoutCompletedWrapper>
				<WPCheckoutCompletedMainContent>
					<PerformanceTrackerStop />
					<Loading className="checkout__pending-content" title={ headingText } />
				</WPCheckoutCompletedMainContent>
			</WPCheckoutCompletedWrapper>
		);
	}

	if (
		shouldShowEmptyCartPage( {
			responseCart,
			areWeRedirecting: isRemovingProductFromCart,
			areThereErrors,
			isCartPendingUpdate,
			isInitialCartLoading,
		} )
	) {
		debug( 'rendering empty cart page' );
		return (
			<WPCheckoutWrapper>
				<WPCheckoutSidebarContent></WPCheckoutSidebarContent>
				<WPCheckoutMainContent>
					<PerformanceTrackerStop />
					<WPCheckoutTitle>{ translate( 'Checkout' ) }</WPCheckoutTitle>
					<EmptyCart />
					<CheckoutFormSubmit
						submitButton={
							<Button buttonType="primary" fullWidth onClick={ goToPreviousPage }>
								{ translate( 'Go back' ) }
							</Button>
						}
					/>
				</WPCheckoutMainContent>
			</WPCheckoutWrapper>
		);
	}

	const nextStepButtonText = translate( 'Continue to payment', { textOnly: true } );
	const canEditPaymentStep = () => {
		if ( ! paymentMethods ) {
			return false;
		}
		const containsFreeOrCreditMethod = paymentMethods.some(
			( method ) => method.id === 'free-purchase'
		);
		if ( paymentMethods.length < 2 && containsFreeOrCreditMethod ) {
			return false;
		}
		return true;
	};

	const content = (
		<WPCheckoutWrapper className="checkout-wrapper">
			<WPCheckoutSidebarContent className="checkout-sidebar-content">
				{ isLoading && <LoadingSidebarContent /> }
				{ ! isLoading && (
					<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
						<CheckoutErrorBoundary
							errorMessage={ translate( 'Sorry, there was an error loading this information.' ) }
							onError={ onSummaryError }
						>
							<CheckoutSummaryTitleLink
								className="checkout__summary-button"
								onClick={ () => setIsSummaryVisible( ! isSummaryVisible ) }
							>
								<CheckoutSummaryTitleContent className="checkout__summary-title">
									<CheckoutSummaryTitle>
										{ ! isStepContainerV2 && (
											<CheckoutSummaryTitleIcon icon="info-outline" size={ 20 } />
										) }
										{ translate( 'Purchase Details' ) }
										<CheckoutSummaryTitleToggle icon="keyboard_arrow_down" />
									</CheckoutSummaryTitle>
									<CheckoutSummaryTitlePrice className="wp-checkout__total-price">
										{ formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
											isSmallestUnit: true,
											stripZeros: true,
										} ) }
									</CheckoutSummaryTitlePrice>
								</CheckoutSummaryTitleContent>
							</CheckoutSummaryTitleLink>

							<CheckoutSummaryBody className="checkout__summary-body">
								{ shouldShowSitePreview && (
									<div className="checkout-site-preview">
										<SitePreviewWrapper>
											<SitePreview showEditSite={ false } showSiteDetails={ false } />
										</SitePreviewWrapper>
									</div>
								) }

								<WPCheckoutOrderSummary
									siteId={ siteId }
									onChangeSelection={ changeSelection }
									showFeaturesList
								/>
								<CheckoutSidebarNudge
									addItemToCart={ addItemToCart }
									areThereDomainProductsInCart={ areThereDomainProductsInCart }
								/>
							</CheckoutSummaryBody>
						</CheckoutErrorBoundary>
					</CheckoutSummaryArea>
				) }
			</WPCheckoutSidebarContent>

			<WPCheckoutMainContent className="checkout-main-content">
				<CheckoutOrderBanner />
				{ isStepContainerV2 ? (
					<Step.Heading
						text={ translate( 'Checkout' ) }
						align="left"
						size={ ! isLargeViewport ? 'small' : undefined }
					/>
				) : (
					<WPCheckoutTitle>{ translate( 'Checkout' ) }</WPCheckoutTitle>
				) }
				<CheckoutStepGroup loadingHeader={ loadingHeader } onStepChanged={ onStepChanged }>
					<PerformanceTrackerStop />
					{ infoMessage }

					<CheckoutStepBody
						onError={ onReviewError }
						className="wp-checkout__review-order-step"
						stepId="review-order-step"
						isStepActive={ false }
						isStepComplete
						titleContent={ <OrderReviewTitle /> }
						completeStepContent={
							<WPCheckoutOrderReview
								removeProductFromCart={ removeProductFromCart }
								replaceProductInCart={ replaceProductInCart }
								couponFieldStateProps={ couponFieldStateProps }
								removeCouponAndClearField={ removeCouponAndClearField }
								isCouponFieldVisible={ isCouponFieldVisible }
								setCouponFieldVisible={ setCouponFieldVisible }
								onChangeSelection={ changeSelection }
								siteUrl={ siteUrl }
								createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
							/>
						}
						formStatus={ formStatus }
					/>

					{ contactDetailsType !== 'none' && (
						<CheckoutStep
							className="checkout-contact-form-step"
							stepId="contact-form"
							isCompleteCallback={ async () => {
								// Touch the fields so they display validation errors
								shouldShowContactDetailsValidationErrors && touchContactFields();
								const validationResponse = await validateContactDetails(
									contactInfo,
									isLoggedOutCart,
									responseCart,
									showErrorMessageBriefly,
									applyDomainContactValidationResults,
									clearDomainContactErrorMessages,
									reduxDispatch,
									translate,
									shouldShowContactDetailsValidationErrors
								);
								if ( validationResponse ) {
									// When the contact details change, update the VAT details on the server.
									try {
										if (
											! isLoggedOutCart &&
											vatDetailsInForm.id &&
											! areVatDetailsSame( vatDetailsInForm, vatDetailsFromServer )
										) {
											await setVatDetails( vatDetailsInForm );
										}
									} catch ( error ) {
										reduxDispatch( removeNotice( 'vat_info_notice' ) );
										if ( shouldShowContactDetailsValidationErrors ) {
											reduxDispatch(
												errorNotice( ( error as Error ).message, { id: 'vat_info_notice' } )
											);
										}
										return false;
									}
									reduxDispatch( removeNotice( 'vat_info_notice' ) );

									// When the contact details change, update the cart's tax location to match.
									try {
										await updateCartContactDetailsForCheckout(
											countriesList,
											responseCart,
											updateLocation,
											contactInfo,
											vatDetailsInForm
										);
									} catch {
										// If updating the cart fails, we should not continue. No need
										// to do anything else, though, because CartMessages will
										// display the error.
										return false;
									}

									// When the contact details change, update the cached contact details on
									// the server. This can fail if validation fails but we will silently
									// ignore failures here because the validation call will handle them better
									// than this will.
									updateCachedContactDetails(
										prepareDomainContactValidationRequest( contactInfo )
									);

									reduxDispatch(
										recordTracksEvent( 'calypso_checkout_composite_step_complete', {
											step: 1,
											step_name: 'contact-form',
										} )
									);
								}
								return validationResponse;
							} }
							activeStepContent={
								<>
									<ConditionalContactDetailsMessage contactDetailsType={ contactDetailsType } />
									<WPContactForm
										countriesList={ countriesList }
										shouldShowContactDetailsValidationErrors={
											shouldShowContactDetailsValidationErrors
										}
										contactDetailsType={ contactDetailsType }
										isLoggedOutCart={ isLoggedOutCart }
										setShouldShowContactDetailsValidationErrors={
											setShouldShowContactDetailsValidationErrors
										}
									/>
								</>
							}
							completeStepContent={
								<>
									<ConditionalContactDetailsMessage contactDetailsType={ contactDetailsType } />
									<WPContactFormSummary
										areThereDomainProductsInCart={ areThereDomainProductsInCart }
										isGSuiteInCart={ isGSuiteInCart }
										isLoggedOutCart={ isLoggedOutCart }
									/>
								</>
							}
							titleContent={ <ContactFormTitle /> }
							editButtonText={ String( translate( 'Edit' ) ) }
							editButtonAriaLabel={ String( translate( 'Edit the contact details' ) ) }
							nextStepButtonText={ nextStepButtonText }
							nextStepButtonAriaLabel={ String(
								translate( 'Continue with the entered contact details' )
							) }
							validatingButtonText={ validatingButtonText }
							validatingButtonAriaLabel={ validatingButtonText }
						/>
					) }
					<PaymentMethodStep
						activeStepHeader={ <GoogleDomainsCopy responseCart={ responseCart } /> }
						canEditStep={ canEditPaymentStep() }
						editButtonText={ String( translate( 'Edit' ) ) }
						editButtonAriaLabel={ String( translate( 'Edit the payment method' ) ) }
						nextStepButtonText={ String( translate( 'Continue' ) ) }
						nextStepButtonAriaLabel={ String(
							translate( 'Continue with the selected payment method' )
						) }
						validatingButtonText={ validatingButtonText }
						validatingButtonAriaLabel={ validatingButtonText }
						isCompleteCallback={ () => {
							// We want to consider this step complete only if there is a
							// payment method selected and it does not have required fields.
							// This will not prevent the form from being submitted because
							// the submit button will be active as long as the last step is
							// shown, but it will prevent the payment method step from
							// automatically collapsing when checkout loads.
							return Boolean( paymentMethod ) && ! paymentMethod?.hasRequiredFields;
						} }
					/>

					<CouponFieldArea
						isCouponFieldVisible={ isCouponFieldVisible }
						setCouponFieldVisible={ setCouponFieldVisible }
						isPurchaseFree={ isPurchaseFree }
						couponStatus={ couponStatus }
						couponFieldStateProps={ couponFieldStateProps }
					/>

					<CheckoutTermsAndCheckboxes
						is3PDAccountConsentAccepted={ is3PDAccountConsentAccepted }
						setIs3PDAccountConsentAccepted={ setIs3PDAccountConsentAccepted }
						is100YearPlanTermsAccepted={ is100YearPlanTermsAccepted }
						setIs100YearPlanTermsAccepted={ setIs100YearPlanTermsAccepted }
						isSubmitted={ isSubmitted }
					/>
					<CheckoutFormSubmit
						validateForm={ validateForm }
						submitButtonHeader={ <SubmitButtonHeader /> }
						submitButtonFooter={
							hasCartJetpackProductsOnly ? (
								<JetpackCheckoutSeals />
							) : (
								<CheckoutMoneyBackGuarantee cart={ responseCart } />
							)
						}
					/>
				</CheckoutStepGroup>
			</WPCheckoutMainContent>
		</WPCheckoutWrapper>
	);

	if ( ! isStepContainerV2 ) {
		return content;
	}

	return (
		<StepContainerV2CheckoutFixer isLargeViewport={ isLargeViewport }>
			<Step.WideLayout
				maxWidth="xhuge"
				hasContentPadding={ false }
				topBar={
					<Step.TopBar
						leftElement={ <Step.BackButton onClick={ leaveModalProps.clickClose } /> }
						rightElement={
							<span className="checkout-skip-button">
								<label>{ helpCenterButtonCopy ?? translate( 'Need extra help?' ) } </label>
								<Step.LinkButton onClick={ toggleHelpCenter }>
									{ helpCenterButtonLink ?? translate( 'Visit Help Center' ) }
								</Step.LinkButton>
							</span>
						}
					/>
				}
			>
				{ content }
			</Step.WideLayout>
			<LeaveCheckoutModal { ...leaveModalProps } />
		</StepContainerV2CheckoutFixer>
	);
}

const StepContainerV2CheckoutFixer = styled.div< { isLargeViewport: boolean } >`
	// This shouldn't exist. It's a hack to make the top bar appear on top of the checkout sidebar, which extends from the top of the page.
	.step-container-v2__top-bar {
		position: relative;
		z-index: 1;
	}

	.checkout-skip-button {
		label {
			display: none;

			@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
				display: inline;
			}
		}
	}

	.checkout-sidebar-plan-upsell {
		margin-inline: 0;
		max-width: 100%;
	}

	${ ( props ) =>
		! props.isLargeViewport &&
		css`
			.checkout-sidebar-content {
				margin-top: 0;
			}

			.checkout__summary-button {
				border-bottom: none;
			}

			.checkout__summary-body {
				padding: var( --step-container-v2-content-block-padding )
					var( --step-container-v2-content-inline-padding );
				max-width: 100%;
			}

			.checkout__summary-features {
				padding: 0;
				width: 100%;
			}

			.checkout__summary-title {
				margin: 0;
				padding: 1rem var( --step-container-v2-content-inline-padding );
				max-width: 100%;
			}

			.checkout-sidebar-plan-upsell {
				margin: 0;
				max-width: 100%;
			}

			.checkout-main-content {
				margin-top: 0;
				padding: var( --step-container-v2-content-block-padding )
					var( --step-container-v2-content-inline-padding );
				max-width: 100%;
			}

			.wp-checkout__review-order-step,
			.checkout-contact-form-step,
			.checkout__payment-method-step,
			.checkout-terms-and-checkboxes,
			.checkout-steps__step-complete-content,
			.checkout-steps__step-content {
				padding-inline: 0;
			}

			.wp-checkout__review-order-step {
				padding-block: 2rem;
			}

			.checkout-steps__submit-button-wrapper {
				max-width: 100%;
				padding-inline: var( --step-container-v2-content-inline-padding );

				@media ( ${ props.theme.breakpoints.tabletUp } ) {
					padding-inline: 0;
				}
			}

			.checkout-steps__submit-footer-wrapper {
				min-height: auto;
			}
		` }

	${ ( props ) =>
		props.isLargeViewport &&
		css`
			.checkout-main-content {
				padding-left: var( --step-container-v2-content-inline-padding );
				margin-top: 3rem;
			}

			.checkout-sidebar-content {
				--left-padding: 3.875rem;
				padding: 2.25rem var( --step-container-v2-content-inline-padding ) 0 var( --left-padding );
				background: none;
				position: relative;
				height: 100%;

				&:before {
					content: '';
					display: block;
					background: var( --color-neutral-0 );
					position: fixed;
					top: calc( var( --step-container-v2-top-bar-height ) * -1 );
					transform: translateX( calc( var( --left-padding ) * -1 ) );
					width: 100vw;
					bottom: 0;
				}
			}

			.checkout-summary-area {
				max-width: 100%;
			}

			.checkout__summary-body {
				margin: 0;
			}
		` }
`;

const CheckoutSummary = styled.div`
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;
	display: flex;
	flex-direction: column;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding-left: 24px;
		padding-right: 24px;
	}
`;

export const CheckoutSummaryAreaUnstyled = ( {
	children,
	className,
}: PropsWithChildren< {
	className?: string;
} > ) => {
	return (
		<CheckoutSummary className={ joinClasses( [ className, 'checkout__summary-area' ] ) }>
			{ children }
		</CheckoutSummary>
	);
};

const CheckoutSummaryArea = styled( CheckoutSummaryAreaUnstyled )`
	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
		max-width: 288px;
		position: relative;
		padding: 0;
	}
`;

const CheckoutSummaryTitleLink = styled.button`
	background: ${ ( props ) => props.theme.colors.background };
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: none;
	}
`;

const CheckoutSummaryTitleContent = styled.span`
	color: ${ ( props ) => props.theme.colors.textColor };
	display: flex;
	font-size: 16px;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	justify-content: space-between;
	margin: 0 auto;
	padding: 24px;
	max-width: 600px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px 0;
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
	box-sizing: border-box;
	margin: 0 auto;
	max-width: 600px;
	width: 100%;
	display: none;
	padding: 24px;

	.is-visible & {
		display: block;
	}

	& .checkout-site-preview {
		grid-area: preview;
		display: none;
	}

	& .checkout-review-order {
		grid-area: review;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		max-width: 328px;
		padding: 0;

		.is-visible &,
		& {
			display: block;
		}

		& .card {
			box-shadow: none;
		}

		& .checkout-site-preview {
			display: block;
		}
	}
`;

const CheckoutSidebarNudgeWrapper = styled.div`
	display: flex;
	flex-direction: column;
	grid-area: nudge;
	row-gap: 16px;

	& > * {
		max-width: 288px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		row-gap: 36px;
	}
`;

const CheckoutTermsAndCheckboxesWrapper = styled.div`
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	padding: 24px;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding-top: 50px;
		padding-bottom: 0;
		padding-inline-start: 40px;
		padding-inline-end: 0;
	}
`;

function CheckoutTermsAndCheckboxes( {
	is3PDAccountConsentAccepted,
	setIs3PDAccountConsentAccepted,
	is100YearPlanTermsAccepted,
	setIs100YearPlanTermsAccepted,
	isSubmitted,
}: {
	is3PDAccountConsentAccepted: boolean;
	setIs3PDAccountConsentAccepted: ( isAccepted: boolean ) => void;
	is100YearPlanTermsAccepted: boolean;
	setIs100YearPlanTermsAccepted: ( isAccepted: boolean ) => void;
	isSubmitted: boolean;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const has100YearPlan = cartHas100YearPlan( responseCart );
	const hasMarketplaceProduct =
		useDoesCartHaveMarketplaceProductRequiringConfirmation( responseCart );

	const translate = useTranslate();

	return (
		<CheckoutTermsAndCheckboxesWrapper className="checkout-terms-and-checkboxes">
			<BeforeSubmitCheckoutHeader />

			{ hasMarketplaceProduct && (
				<AcceptTermsOfServiceCheckbox
					isAccepted={ is3PDAccountConsentAccepted }
					onChange={ setIs3PDAccountConsentAccepted }
					isSubmitted={ isSubmitted }
					message={ translate(
						'You agree that an account may be created on a third party developer’s site related to the products you have purchased.'
					) }
				/>
			) }
			{ has100YearPlan && (
				<AcceptTermsOfServiceCheckbox
					isAccepted={ is100YearPlanTermsAccepted }
					onChange={ setIs100YearPlanTermsAccepted }
					isSubmitted={ isSubmitted }
					message={ translate( 'I have read and agree to all of the above.' ) }
				/>
			) }
		</CheckoutTermsAndCheckboxesWrapper>
	);
}

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

function useDoesCartHaveMarketplaceProductRequiringConfirmation(
	responseCart: ResponseCart
): boolean {
	const excluded3PDAccountProductSlugs = [ 'sensei_pro_monthly', 'sensei_pro_yearly' ];
	return responseCart.products
		.filter(
			( product ) =>
				! (
					product.product_slug && excluded3PDAccountProductSlugs.includes( product.product_slug )
				)
		)
		.some( ( product ) => product.extra.is_marketplace_product );
}

const JetpackCheckoutSeals = () => {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const translate = useTranslate();
	const show7DayGuarantee = responseCart?.products?.every( isMonthlyProduct );
	const show14DayGuarantee = responseCart?.products?.every(
		( product ) => isYearly( product ) || isBiennially( product ) || isTriennially( product )
	);
	const moneybackGuaranteeHeader =
		show7DayGuarantee || show14DayGuarantee ? (
			translate( '%(dayCount)s-day money back guarantee', {
				args: {
					dayCount: show7DayGuarantee ? 7 : 14,
				},
			} )
		) : (
			<>
				{ translate( '14-day money back guarantee on yearly subscriptions' ) }
				<br />
				{ translate( '7-day money back guarantee on monthly subscriptions' ) }
			</>
		);
	let moneybackGuaranteeIcon = badgeGenericSrc;

	if ( show7DayGuarantee ) {
		moneybackGuaranteeIcon = badge7Src;
	} else if ( show14DayGuarantee ) {
		moneybackGuaranteeIcon = badge14Src;
	}

	return (
		<JetpackCheckoutSealsWrapper>
			<JetpackCheckoutSealsSection>
				<img src={ moneybackGuaranteeIcon } alt="" />

				<JetpackSealText>{ moneybackGuaranteeHeader }</JetpackSealText>
			</JetpackCheckoutSealsSection>

			<JetpackCheckoutSealsSection>
				<img src={ badgeSecurity } alt="" />

				<JetpackSealText>{ translate( 'SSL Secure checkout' ) }</JetpackSealText>
			</JetpackCheckoutSealsSection>
		</JetpackCheckoutSealsWrapper>
	);
};

const JetpackCheckoutSealsWrapper = styled.div< React.HTMLAttributes< HTMLDivElement > >`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.5rem;
	padding: 1.5rem 4rem 0 1.5rem;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 1.5rem 1.5rem 0;
	}

	img {
		margin-right: 0.75rem;
	}

	span {
		font-weight: 700;

		line-height: 1.12;
	}
`;

const JetpackCheckoutSealsSection = styled.div< React.HTMLAttributes< HTMLDivElement > >`
	display: flex;
	align-items: center;

	color: ${ ( props ) => props.theme.colors.textColor };
`;

const JetpackSealText = styled.span`
	padding: 0.1875rem 0 0 0;
`;

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

const WPCheckoutWrapper = styled.div`
	display: grid;
	grid-template-rows: auto;
	grid-template-columns: 1fr;
	grid-template-areas: 'sidebar-content' 'main-content';
	justify-content: center;
	justify-items: center;
	min-height: 100vh;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		grid-template-columns: 1fr minmax( 500px, 688px ) 376px 1fr;
		grid-template-areas: 'main-content main-content sidebar-content sidebar-content';
		justify-items: end;
	}

	& > * {
		box-sizing: border-box;
		width: 100%;

		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			min-height: 100vh;
		}
	}

	& *:focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}
`;

const WPCheckoutCompletedWrapper = styled.div`
	display: flex;
	justify-content: center;
	justify-items: center;
	min-height: 100vh;
	& > * {
		box-sizing: border-box;
		width: 100%;
		@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
			min-height: 100vh;
		}
	}
	& *:focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}
`;

const WPCheckoutMainContent = styled.div`
	grid-area: main-content;
	margin-top: 50px;
	min-height: 100vh;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0 24px;
		max-width: 648px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-top: calc( var( --masterbar-checkout-height ) + 24px );
		max-width: 688px;
		padding: 0 64px 0 24px;

		.rtl & {
			padding: 0 24px 0 64px;
		}
	}

	.editor-checkout-modal & {
		margin-top: 20px;
	}
`;

const WPCheckoutCompletedMainContent = styled.div`
	margin-top: 60px;
	min-height: 100vh;
	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0 24px;
		max-width: 648px;
	}
`;

const WPCheckoutSidebarContent = styled.div`
	background: ${ ( props ) => props.theme.colors.background };
	grid-area: sidebar-content;
	margin-top: var( --masterbar-height );

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		margin-top: var( --masterbar-checkout-height );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-top: 0;
		padding: 144px 24px 144px 64px;

		.rtl & {
			padding: 144px 64px 0 24px;
		}
	}

	.editor-checkout-modal & {
		padding: 68px 24px 144px 64px;

		.rtl & {
			padding: 68px 64px 0 24px;
		}
	}
`;
const SitePreviewWrapper = styled.div`
	.home-site-preview {
		margin-bottom: 1.5em;
		padding: 0.5em;
		box-shadow:
			0 0 0 1px var( --color-border-subtle ),
			rgba( 0, 0, 0, 0.2 ) 0 7px 30px -10px;
		border-radius: 6px;
		& .home-site-preview__thumbnail-wrapper {
			aspect-ratio: 16 / 9;
			border-radius: 6px;
			box-shadow: none;
			min-width: 100%;
			&:hover {
				box-shadow: unset;
				& .home-site-preview__thumbnail {
					opacity: unset;
				}
			}
		}
		& home-site-preview__thumbnail {
			opacity: 1;
		}
	}
`;

const WPCheckoutTitle = styled.div`
	font-size: 44px;
	font-family: 'Recoleta', serif;
	font-weight: ${ ( props ) => props.theme.weights.bold };
	line-height: 1em;
	padding: 0 24px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0;
	}
`;
