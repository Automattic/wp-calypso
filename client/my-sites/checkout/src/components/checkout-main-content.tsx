import {
	isYearly,
	isJetpackPurchasableItem,
	isMonthlyProduct,
	isBiennially,
	isTriennially,
} from '@automattic/calypso-products';
import colorStudio from '@automattic/color-studio';
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
import { formatCurrency } from '@automattic/number-formatters';
import { Step } from '@automattic/onboarding';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	styled,
	joinClasses,
	getContactDetailsType,
	ContactDetailsType,
	RestorableProductsProvider,
} from '@automattic/wpcom-checkout';
import { css, keyframes } from '@emotion/react';
import { Icon } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { pencil } from '@wordpress/icons';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Loading from 'calypso/components/loading';
import { useInitialIsInStepContainerV2FlowContext } from 'calypso/layout/utils';
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
import { useCheckoutUiRedesignExperiment } from 'calypso/my-sites/checkout/src/hooks/use-checkout-ui-redesign-experiment';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/src/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/src/lib/leave-checkout';
import {
	SubmitButtonSlotContext,
	useSubmitButtonSlot,
} from 'calypso/my-sites/checkout/src/lib/submit-button-slot';
import { prepareDomainContactValidationRequest } from 'calypso/my-sites/checkout/src/types/wpcom-store-state';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import SitePreview from 'calypso/my-sites/customer-home/cards/features/site-preview';
import useOneDollarOfferTrack from 'calypso/my-sites/plans/hooks/use-onedollar-offer-track';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
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
import CheckoutProcessorNotice from './checkout-processor-notice';
import { CheckoutSidebarPlanUpsell } from './checkout-sidebar-plan-upsell';
import CheckoutTrustCards from './checkout-trust-cards';
import { EmptyCart, shouldShowEmptyCartPage } from './empty-cart';
import JetpackAkismetCheckoutSidebarPlanUpsell from './jetpack-akismet-checkout-sidebar-plan-upsell';
import { LeaveCheckoutModal, useCheckoutLeaveModal } from './leave-checkout-modal';
import BeforeSubmitCheckoutHeader from './payment-method-step';
import { PaymentMethodFilter } from './payment-methods-filter';
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
		<LoadingSidebar className="checkout-loading-sidebar">
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

// Renders CheckoutFormSubmit inside CheckoutStepGroup (so it keeps full step-state
// awareness) while portaling its output into the sidebar slot registered via
// SubmitButtonSlotContext. The sidebar button IS the active payment-method submit
// button — no hidden main-column button, no querySelector click proxy.
function PortaledCheckoutFormSubmit( {
	validateForm,
}: {
	validateForm?: () => Promise< boolean >;
} ) {
	const { slotEl } = useSubmitButtonSlot();
	if ( ! slotEl ) {
		return null;
	}
	return createPortal( <CheckoutFormSubmit validateForm={ validateForm } />, slotEl );
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
	areStoredCardsFiltered,
	isBusinessCardsFilterEmpty,
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
	areStoredCardsFiltered?: boolean;
	isBusinessCardsFilterEmpty?: boolean;
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
		addProductsToCart,
		isPendingUpdate: isCartPendingUpdate,
		removeCoupon,
		couponStatus,
	} = useShoppingCart( cartKey );

	const leaveModalProps = useCheckoutLeaveModal( { siteUrl: siteUrl ?? '' } );

	// Shared sidebar slot for the active payment-method submit button. We render
	// <CheckoutFormSubmit> inside <CheckoutStepGroup> so it keeps full step-state
	// awareness, but createPortal its output into this slot in the sidebar — the
	// sidebar Pay button IS the real submit button (including native Apple Pay /
	// Google Pay buttons that require a genuine user click).
	const [ submitButtonSlotEl, setSubmitButtonSlotEl ] = useState< HTMLElement | null >( null );
	const submitButtonSlotValue = useMemo(
		() => ( { slotEl: submitButtonSlotEl, setSlotEl: setSubmitButtonSlotEl } ),
		[ submitButtonSlotEl ]
	);

	const searchParams = new URLSearchParams( window.location.search );
	const isDIFMInCart = hasDIFMProduct( responseCart );
	const isSignupCheckout = searchParams.get( 'signup' ) === '1';
	// The flow that redirected to checkout may pass a step indicator via the
	// `steps_current` / `steps_total` query params. Checkout has no per-flow
	// knowledge — any flow can opt in by including the params. Mobile-only.
	const isMobileViewport = useViewportMatch( 'small', '<' );
	const stepsCurrent = Number( searchParams.get( 'steps_current' ) );
	const stepsTotal = Number( searchParams.get( 'steps_total' ) );
	const stepCounter =
		isMobileViewport &&
		Number.isInteger( stepsCurrent ) &&
		stepsCurrent > 0 &&
		Number.isInteger( stepsTotal ) &&
		stepsTotal > 0 &&
		stepsCurrent <= stepsTotal
			? { current: stepsCurrent, total: stepsTotal }
			: null;
	const selectedSiteData = useSelector( getSelectedSite );
	const wpcomDomain = useSelector( ( state ) =>
		getWpComDomainBySiteId( state, selectedSiteData?.ID )
	);

	// Only show the site preview for WPCOM domains that have a site connected to the site id
	const shouldShowSitePreview =
		showSitePreview && selectedSiteData && wpcomDomain && ! isSignupCheckout && ! isDIFMInCart;

	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const reduxDispatch = useReduxDispatch();

	const presalesChatKey = getPresalesChatKey( responseCart );
	const isPresalesChatEnabled =
		! useSelector( getIsOnboardingAffiliateFlow ) &&
		responseCart?.products?.length > 0 &&
		presalesChatKey !== 'wpcom';
	usePresalesChat( presalesChatKey, isPresalesChatEnabled );

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

	const forceCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl, siteId );
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

	const isStepContainerV2 = useInitialIsInStepContainerV2FlowContext();
	const isLargeViewport = useViewportMatch( 'large', '>=' );

	const [ , isCheckoutUiRedesignV1 ] = useCheckoutUiRedesignExperiment();
	const originalPriceForHeader = responseCart.products.reduce(
		( sum, product ) => sum + product.item_original_subtotal_integer,
		0
	);
	const hasDiscountForHeader = originalPriceForHeader > responseCart.total_cost_integer;

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
		if ( isStepContainerV2 ) {
			return (
				<>
					<PerformanceTrackerStop />
					<Step.Loading />
				</>
			);
		}

		const headingText = translate( 'Almost there—we’re currently finalizing your order.' );

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
					<WPCheckoutTitle className="checkout__main-title">
						{ translate( 'Checkout' ) }
					</WPCheckoutTitle>
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

	const checkoutSummary = (
		<WPCheckoutSidebarContent className="checkout-sidebar-content">
			{ isLoading && <LoadingSidebarContent /> }
			{ ! isLoading && (
				<>
					<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
						<CheckoutErrorBoundary
							errorMessage={ translate( 'Sorry, there was an error loading this information.' ) }
							onError={ onSummaryError }
						>
							{ isCheckoutUiRedesignV1 ? (
								<CheckoutSummaryTitleLinkRedesign
									className="checkout__summary-button"
									onClick={ () => setIsSummaryVisible( ! isSummaryVisible ) }
								>
									<CheckoutSummaryTitleContentRedesign className="checkout__summary-title">
										<CheckoutSummaryTitle>
											<CheckoutSummaryBagIconWrapper>
												<MaterialIcon icon="shopping_cart" size={ 24 } />
											</CheckoutSummaryBagIconWrapper>
											{ translate( 'Purchase details' ) }
										</CheckoutSummaryTitle>
										<CheckoutSummaryPricesWrapper>
											{ hasDiscountForHeader && (
												<CheckoutSummaryOriginalPrice>
													{ formatCurrency( originalPriceForHeader, responseCart.currency, {
														isSmallestUnit: true,
														stripZeros: true,
													} ) }
												</CheckoutSummaryOriginalPrice>
											) }
											<CheckoutSummaryCurrentPrice>
												{ formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
													isSmallestUnit: true,
													stripZeros: true,
												} ) }
											</CheckoutSummaryCurrentPrice>
											<CheckoutSummaryTitleToggle icon="keyboard_arrow_down" />
										</CheckoutSummaryPricesWrapper>
									</CheckoutSummaryTitleContentRedesign>
								</CheckoutSummaryTitleLinkRedesign>
							) : (
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
							) }

							<CheckoutSummaryBody className="checkout__summary-body">
								{ shouldShowSitePreview && (
									<div className="checkout-site-preview">
										<SitePreviewWrapper>
											<SitePreview showEditSite={ false } showSiteDetails={ false } />
										</SitePreviewWrapper>
									</div>
								) }

								<WPCheckoutOrderSummary />
								{ ! isCheckoutUiRedesignV1 && (
									<CheckoutSidebarNudge
										addItemToCart={ addItemToCart }
										areThereDomainProductsInCart={ areThereDomainProductsInCart }
									/>
								) }
							</CheckoutSummaryBody>
						</CheckoutErrorBoundary>
						{ isCheckoutUiRedesignV1 && ( isSummaryVisible || isLargeViewport ) && (
							<CheckoutSummaryNudgeArea>
								<CheckoutSidebarNudge
									addItemToCart={ addItemToCart }
									areThereDomainProductsInCart={ areThereDomainProductsInCart }
								/>
							</CheckoutSummaryNudgeArea>
						) }
					</CheckoutSummaryArea>
				</>
			) }
		</WPCheckoutSidebarContent>
	);

	const checkoutMainContent = (
		<RestorableProductsProvider>
			<WPCheckoutMainContent className="checkout-main-content">
				<CheckoutOrderBanner />
				{ isStepContainerV2 ? (
					<Step.Heading
						text={ translate( 'Checkout' ) }
						align="left"
						size={ ! isLargeViewport ? 'small' : undefined }
					/>
				) : (
					<WPCheckoutTitle className="checkout__main-title">
						{ translate( 'Checkout' ) }
					</WPCheckoutTitle>
				) }
				<CheckoutStepGroup
					loadingHeader={ loadingHeader }
					onStepChanged={ onStepChanged }
					scrollToStepOnForwardNavigation={ ! isLargeViewport }
				>
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
								addProductsToCart={ addProductsToCart }
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
							onPageLoadError={ onPageLoadError }
							isCompleteCallback={ async () => {
								// Touch the fields so they display validation errors
								if ( shouldShowContactDetailsValidationErrors ) {
									touchContactFields();
								}
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
							editButtonText={ isCheckoutUiRedesignV1 ? undefined : String( translate( 'Edit' ) ) }
							editButtonElement={
								isCheckoutUiRedesignV1 ? <Icon icon={ pencil } size={ 18 } /> : undefined
							}
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
						activeStepHeader={
							<PaymentMethodFilter
								areStoredCardsFiltered={ areStoredCardsFiltered }
								isBusinessCardsFilterEmpty={ isBusinessCardsFilterEmpty }
							/>
						}
						canEditStep={ canEditPaymentStep() }
						editButtonText={ isCheckoutUiRedesignV1 ? undefined : String( translate( 'Edit' ) ) }
						editButtonElement={
							isCheckoutUiRedesignV1 ? <Icon icon={ pencil } size={ 18 } /> : undefined
						}
						editButtonAriaLabel={ String( translate( 'Edit the payment method' ) ) }
						nextStepButtonText={ String( translate( 'Continue' ) ) }
						nextStepButtonAriaLabel={ String(
							translate( 'Continue with the selected payment method' )
						) }
						validatingButtonText={ validatingButtonText }
						validatingButtonAriaLabel={ validatingButtonText }
						onPageLoadError={ onPageLoadError }
						waitForPaymentMethodIds={ [ 'apple-pay', 'google-pay' ] }
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
						isLargeViewport={ isLargeViewport }
					/>
					{ isLargeViewport ? (
						<PortaledCheckoutFormSubmit validateForm={ validateForm } />
					) : (
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
					) }
				</CheckoutStepGroup>
			</WPCheckoutMainContent>
		</RestorableProductsProvider>
	);

	if ( ! isStepContainerV2 ) {
		return (
			<SubmitButtonSlotContext.Provider value={ submitButtonSlotValue }>
				<WPCheckoutWrapper
					className="checkout-wrapper"
					isLargeViewport={ isLargeViewport }
					isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }
				>
					{ isCheckoutUiRedesignV1 && ! isLargeViewport && (
						<WPCheckoutTitle className="checkout__main-title checkout__redesign-header">
							{ translate( 'Checkout' ) }
						</WPCheckoutTitle>
					) }
					{ checkoutSummary }
					{ checkoutMainContent }
					{ isLargeViewport && (
						<>
							<CheckoutProcessorNotice />
							<CheckoutTrustCards cart={ responseCart } />
						</>
					) }
				</WPCheckoutWrapper>
			</SubmitButtonSlotContext.Provider>
		);
	}

	return (
		<SubmitButtonSlotContext.Provider value={ submitButtonSlotValue }>
			<StepContainerV2CheckoutFixer
				isLargeViewport={ isLargeViewport }
				isCheckoutUiRedesignV1={ isCheckoutUiRedesignV1 }
			>
				<Step.TwoColumnLayout
					firstColumnWidth={ 8 }
					secondColumnWidth={ 4 }
					topBar={ ( { isLargeViewport } ) => {
						const topBar = (
							<Step.TopBar
								leftElement={ <Step.BackButton onClick={ leaveModalProps.clickClose } /> }
								rightElement={
									<>
										{ stepCounter && (
											<Step.StepCounter
												current={ stepCounter.current }
												total={ stepCounter.total }
											/>
										) }
										<span className="checkout-skip-button">
											{ helpCenterButtonCopy && <label>{ helpCenterButtonCopy }</label> }
											<Step.LinkButton onClick={ toggleHelpCenter }>
												{ helpCenterButtonLink }
											</Step.LinkButton>
										</span>
									</>
								}
							/>
						);

						if ( isLargeViewport ) {
							return <div className="checkout-top-bar-wrapper">{ topBar }</div>;
						}

						return (
							<>
								{ topBar }
								{ isCheckoutUiRedesignV1 && (
									<Step.Heading text={ translate( 'Checkout' ) } align="left" size="small" />
								) }
								{ checkoutSummary }
							</>
						);
					} }
				>
					{ ( { isLargeViewport } ) => {
						if ( isLargeViewport ) {
							return (
								<>
									<div className="checkout-main-column">
										{ checkoutMainContent }
										<CheckoutProcessorNotice />
										<CheckoutTrustCards cart={ responseCart } />
									</div>
									{ checkoutSummary }
								</>
							);
						}

						return checkoutMainContent;
					} }
				</Step.TwoColumnLayout>
				<LeaveCheckoutModal { ...leaveModalProps } />
			</StepContainerV2CheckoutFixer>
		</SubmitButtonSlotContext.Provider>
	);
}

const StepContainerV2CheckoutFixer = styled.div< {
	isLargeViewport: boolean;
	isCheckoutUiRedesignV1?: boolean;
} >`
	background: ${ colorStudio.colors[ 'White' ] };

	// This shouldn't exist. It's a hack to make the top bar appear on top of the checkout sidebar, which extends from the top of the page.
	.checkout-top-bar-wrapper {
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
				padding-bottom: 24px;
				width: 100%;
			}

			.checkout__summary-title {
				margin: 0;
				padding: 1rem var( --step-container-v2-content-inline-padding );
				max-width: 100%;
			}

			.checkout-sidebar-plan-upsell.promo-card {
				margin: 0;
				max-width: 100%;
			}

			.checkout-main-content {
				margin: 0;
				padding: 0;
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
		` }

	${ ( props ) =>
		props.isLargeViewport &&
		css`
			.checkout-main-content {
				padding: 0;
				margin-top: 1rem;
				max-width: 100%;
			}

			.checkout-sidebar-content {
				--left-padding: 4rem;
				padding: 0 0 0 var( --left-padding );
				background: none;
				position: relative;
				height: 100%;
			}

			.checkout__summary-area,
			.checkout__summary-body {
				max-width: 100%;
			}

			.checkout__summary-area,
			.checkout-loading-sidebar {
				min-width: 300px;
			}

			.checkout__summary-body {
				margin: 0;
			}

			.checkout__summary-features {
				padding-top: 32px;
			}
		` }
	${ ( props ) =>
		props.isLargeViewport &&
		css`
			/*
			 * Stick the inner summary area, not the sidebar wrapper.
			 *
			 * Earlier versions targeted div:has( .checkout-sidebar-content )
			 * which matched multiple ancestors; making each sticky with no
			 * positioned containing block let the upsell paint over the trust
			 * cards row at scroll-bottom. Targeting .checkout-sidebar-content
			 * directly didn't help either: when the sidebar is the sticky
			 * element it equals its containing block's height (the column
			 * stretches it), leaving no room to actually stick — so the
			 * sticky degenerated to static and the Pay CTA scrolled away.
			 *
			 * .checkout__summary-area is shorter than the sidebar (just the
			 * order card + upsell), so it has room to slide within the
			 * stretched sidebar's bounds and pin to top: 32px.
			 */
			.checkout__summary-area {
				position: sticky;
				top: 32px;
			}
			.checkout__summary-area,
			.checkout-loading-sidebar {
				min-width: 384px;
			}
			/*
			 * Give the sticky .checkout__summary-area room to slide.
			 *
			 * TwoColumnLayout's row uses align-items: flex-start at break-large
			 * (packages/onboarding/.../TwoColumnLayout/style.scss), so its
			 * column wrappers size to content instead of stretching to row
			 * height. With the right column collapsed, .checkout-sidebar-content
			 * inside it is just as short as the .checkout__summary-area it
			 * contains — so the sticky rule above has zero distance to travel.
			 *
			 * Override the row's align-items to stretch (so both column wrappers
			 * match row height), then promote the sidebar's column wrapper to a
			 * flex column so .checkout-sidebar-content fills it. The legacy
			 * WPCheckoutWrapper path gets this for free via grid-area stretching.
			 */
			.step-container-v2__content-row--two-column-layout {
				align-items: stretch;
			}
			.step-container-v2__content-row--two-column-layout > div:has( > .checkout-sidebar-content ) {
				display: flex;
				flex-direction: column;
			}
			.checkout-sidebar-content {
				flex: 1;
			}
			/*
			 * Keep the totals + Pay CTA + terms always visible regardless of
			 * cart length. Cap the summary card itself (not the whole area)
			 * at viewport height, scroll the line items list inside, and
			 * lock the bottom block (subtotal/total/CTA/terms) at full size.
			 *
			 * The Save 19% upsell below the card sits at its natural size;
			 * if it doesn't fit alongside the card in a short viewport,
			 * it scrolls past the bottom — the Pay CTA is the priority.
			 */
			.checkout__summary-card {
				max-height: calc( 100vh - 64px );
				display: flex;
				flex-direction: column;
			}
			.checkout__summary-card > .wp-checkout-order-summary__products-list {
				flex: 1 1 auto;
				min-height: 0;
				overflow-y: auto;
			}
			.checkout__summary-card > .wp-checkout-order-summary__section-title,
			.checkout__summary-card > .wp-checkout-order-summary__amount-wrapper {
				flex-shrink: 0;
			}
			/*
			 * Lock intrinsic child sizing so the 24px gap between the sticky order
			 * card and the two-year upsell isn't collapsed when the sticky area
			 * reaches the bottom of its grid cell.
			 */
			.checkout__summary-area > * {
				flex-shrink: 0;
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		! props.isLargeViewport &&
		css`
			.checkout-sidebar-content {
				background: ${ colorStudio.colors[ 'White' ] };
			}
			.checkout__summary-area {
				background: #f5f5f5;
				border: 1px solid ${ colorStudio.colors[ 'Gray 10' ] };
				border-radius: 8px;
				margin: 12px 16px;
				overflow: hidden;
				width: calc( 100% - 32px );
			}
			.checkout__summary-button {
				background: transparent;
				border-bottom: none;
			}
			.checkout__summary-body {
				padding-block-start: 0;
			}
			.wp-checkout-order-summary__section-title {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 10' ] };
				padding-top: 20px;
			}
			.step-container-v2__top-bar-wrapper .step-container-v2__heading {
				padding-inline: 16px;
				margin-bottom: 4px;
			}
			.checkout-main-content .step-container-v2__heading {
				display: none;
			}
			.checkout-step {
				padding: 16px 16px 48px 16px;
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		css`
			.checkout__main-title,
			.step-container-v2__heading h1 {
				font-size: 28px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout__summary-card {
				background: transparent;
				box-shadow: none;
				padding: 0;
				padding-inline-end: 22px;
				margin-bottom: 0;
			}
			.promo-card.checkout-sidebar-plan-upsell {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
				border-radius: 8px;
				margin: 0;
				max-width: none;
				width: 100%;
			}
			.checkout-sidebar-plan-upsell__plan-grid > div {
				border-top: none;
			}
			.item-variation-picker {
				background: #ffffff;
				border: 1px solid #e0e0e0;
				border-radius: 8px;
				overflow: hidden;
				padding: 0;
			}
			.item-variation-picker > li {
				margin: 0;
				border-bottom: 1px solid #f0f0f0;
			}
			.item-variation-picker > li:last-child {
				border-bottom: none;
			}
			.item-variation-picker > li > div.is-checked {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
			}
			.item-variation-picker > li > div::before,
			.item-variation-picker > li > div:hover::before {
				border: none;
			}
			.item-variation-picker > li > div > label {
				min-height: 52px;
			}
			.checkout-step__stepper > div > div:first-child {
				border: 1px solid ${ colorStudio.colors[ 'Gray 90' ] };
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-weight: 600;
			}
			.checkout-payment-methods {
				background: #ffffff;
				border: 1px solid #e0e0e0;
				border-radius: 8px;
				overflow: hidden;
				padding-top: 0;
			}
			.checkout-payment-methods .has-highlight,
			.item-variation-picker > li > div {
				border-radius: 0;
			}
			.checkout-payment-methods .has-highlight {
				margin: 0;
				border-bottom: 1px solid #f0f0f0;
			}
			.checkout-payment-methods .has-highlight:last-child {
				border-bottom: none;
			}
			.checkout-payment-methods .has-highlight.is-checked {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
			}
			.checkout-payment-methods .has-highlight::before,
			.checkout-payment-methods .has-highlight:hover::before {
				border: none;
			}
			.checkout-payment-methods .has-highlight > label {
				min-height: 52px;
				font-size: 13px;
				font-weight: 400;
			}
			.checkout-payment-methods .payment-logos {
				display: flex;
				filter: none;
			}
			.checkout-payment-methods .StripeElement {
				background-color: field;
			}
			div:has( > .credit-card-fields-inner-wrapper ) {
				padding: 0 16px 16px 16px;
			}
			.checkout-steps__step-complete-content .checkout-payment-methods {
				background: white;
				padding: 12px 16px;
				min-height: 52px;
				display: flex;
				align-items: center;
				box-sizing: border-box;
				font-size: 15px;
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 90' ] };
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content {
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 90' ] };
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content ul:empty {
				display: none;
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content ul {
				margin-top: 0;
			}
			.checkout-step__edit-button {
				padding: 4px;
				display: flex;
				align-items: center;
				line-height: 1;
			}
			.checkout-step__header h2 {
				font-size: 15px;
			}
			.checkout-step__header h2 > span {
				font-weight: 590;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout-step--active .checkout-step__header,
			.checkout-step--complete .checkout-step__header {
				margin-block-end: 24px;
			}
			.wp-checkout__review-order-step .checkout-step__header h2 > span {
				font-weight: 500;
			}
			.wp-checkout-order-review__show-coupon-field-button {
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-weight: 500;
				text-decoration: none;
			}
			div:has( > div > .wp-checkout-order-review__show-coupon-field-button ) {
				margin-block-start: -4px;
				padding-block-start: 0;
			}
			.wp-checkout__review-order-step .checkout-step__stepper {
				@media ( max-width: 699px ) {
					display: none;
				}
			}
			.wp-checkout__review-order-step .checkout-step__header h2 {
				font-size: 20px;
			}
			.wp-checkout__review-order-step .checkout-line-item {
				font-size: 15px;
			}
			.wp-checkout__review-order-step .order-review-line-items {
				margin-top: 0;
			}
			.wp-checkout__review-order-step .checkout-review-order__site {
				font-size: 13px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 40' ] };
				@media ( ${ props.theme.breakpoints.tabletUp } ) {
					margin-top: 0;
				}
			}
			.checkout-contact-form-step .checkout-steps__step-content > p {
				font-size: 12px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 40' ] };
			}
			.checkout__terms strong {
				font-size: 16px;
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout__terms-item {
				font-size: 12px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 40' ] };
			}
			.checkout__summary-title {
				font-size: 13px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout__summary-body {
				color: ${ colorStudio.colors[ 'Gray 70' ] };
			}
			.wp-checkout-order-summary__subtotal,
			.wp-checkout-order-summary__total {
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-size: 13px;
				line-height: 20px;
			}
			.wp-checkout-order-summary__subtotal .wp-checkout-order-summary__subtotal-price {
				font-size: 13px;
			}
			.wp-checkout-order-summary__line-item,
			.wp-checkout-order-summary__tax-not-calculated {
				font-size: 13px;
			}
			.wp-checkout-order-summary__section-title {
				margin-bottom: 0;
			}
			.wp-checkout-order-summary__section-title > span {
				display: none;
			}
			.cost-overrides-list-product-wrapper,
			:has( > .cost-overrides-list-item--coupon ) {
				padding-inline-start: 0;
			}
			.cost-overrides-list-product-wrapper > svg[aria-hidden='true'],
			:has( > .cost-overrides-list-item--coupon ) > svg[aria-hidden='true'] {
				display: none;
			}
			.wp-checkout-order-summary__amount-wrapper {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 10' ] };
			}
			.wp-checkout-order-summary__subtotal-section {
				border-bottom: 1px dashed ${ colorStudio.colors[ 'Gray 10' ] };
			}
			.checkout-terms-and-checkboxes {
				padding-block-start: 24px;
			}
			.checkout-terms-and-checkboxes > *:first-child {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 10' ] };
			}
			.checkout-steps__submit-footer-wrapper > div {
				margin-top: 8px;
			}
			.checkout-steps__submit-footer-wrapper > div > svg {
				display: none;
			}
			.checkout-steps__submit-footer-wrapper > div > p {
				font-size: 13px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 70' ] };
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		props.isLargeViewport &&
		css`
			div:has( > div > .wp-checkout-order-review__show-coupon-field-button ) {
				padding-block-start: 24px;
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
	align-items: center;
	margin: 0 auto;
	padding: 24px;
	max-width: 600px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px 0;
	}
`;

const CheckoutSummaryTitle = styled.span`
	display: flex;
	align-items: center;
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
		max-width: 384px;
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
	isLargeViewport,
}: {
	is3PDAccountConsentAccepted: boolean;
	setIs3PDAccountConsentAccepted: ( isAccepted: boolean ) => void;
	is100YearPlanTermsAccepted: boolean;
	setIs100YearPlanTermsAccepted: ( isAccepted: boolean ) => void;
	isSubmitted: boolean;
	isLargeViewport: boolean;
} ) {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const has100YearPlan = cartHas100YearPlan( responseCart );
	const hasMarketplaceProduct =
		useDoesCartHaveMarketplaceProductRequiringConfirmation( responseCart );

	const translate = useTranslate();

	const needsConsentCheckbox = hasMarketplaceProduct || has100YearPlan;

	return (
		<CheckoutTermsAndCheckboxesWrapper className="checkout-terms-and-checkboxes">
			{
				// Keep the inline legal block above the consent checkbox so
				// "I have read and agree to all of the above" still refers to
				// something visible. On desktop without a consent checkbox the
				// same text is reachable via the sidebar's Read more modal;
				// mobile has no sidebar modal, so always render it inline.
				( ! isLargeViewport || needsConsentCheckbox ) && <BeforeSubmitCheckoutHeader />
			}

			{ hasMarketplaceProduct && (
				<AcceptTermsOfServiceCheckbox
					isAccepted={ is3PDAccountConsentAccepted }
					onChange={ setIs3PDAccountConsentAccepted }
					isSubmitted={ isSubmitted }
					message={ translate(
						"You agree that an account may be created on a third party developer's site related to the products you have purchased."
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

const WPCheckoutWrapper = styled.div< {
	isLargeViewport?: boolean;
	isCheckoutUiRedesignV1?: boolean;
} >`
	background: ${ colorStudio.colors[ 'White' ] };
	display: grid;
	grid-template-columns: 1fr;
	grid-template-areas:
		'sidebar-content'
		'main-content'
		'processor-notice'
		'trust-cards';
	align-content: start;
	justify-content: center;
	justify-items: center;
	min-height: 100vh;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		grid-template-columns: 1fr minmax( 500px, 688px ) 475px 1fr;
		grid-template-areas:
			'main-content main-content sidebar-content sidebar-content'
			'. processor-notice sidebar-content sidebar-content'
			'. trust-cards sidebar-content sidebar-content';
		justify-items: end;
	}

	& > * {
		box-sizing: border-box;
		width: 100%;
	}

	& > .checkout-trust-cards {
		grid-area: trust-cards;
		justify-self: center;
	}

	& > .checkout-processor-notice {
		grid-area: processor-notice;
		justify-self: center;
	}

	& *:focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}

	.checkout__summary-area {
		position: sticky;
		top: 32px;
	}
	${ ( props ) =>
		props.isLargeViewport &&
		css`
			.checkout__summary-body,
			.checkout-loading-sidebar,
			.checkout-sidebar-plan-upsell {
				min-width: 384px;
			}
			/*
			 * Keep the totals + Pay CTA + terms always visible regardless of
			 * cart length. Cap the summary card itself (not the whole area)
			 * at viewport height, scroll the line items list inside, and
			 * lock the bottom block (subtotal/total/CTA/terms) at full size.
			 *
			 * The Save 19% upsell below the card sits at its natural size;
			 * if it doesn't fit alongside the card in a short viewport,
			 * it scrolls past the bottom — the Pay CTA is the priority.
			 */
			.checkout__summary-card {
				max-height: calc( 100vh - 64px );
				display: flex;
				flex-direction: column;
			}
			.checkout__summary-card > .wp-checkout-order-summary__products-list {
				flex: 1 1 auto;
				min-height: 0;
				overflow-y: auto;
			}
			.checkout__summary-card > .wp-checkout-order-summary__section-title,
			.checkout__summary-card > .wp-checkout-order-summary__amount-wrapper {
				flex-shrink: 0;
			}
			/*
			 * Lock intrinsic child sizing so the 24px gap between the sticky
			 * order card and the two-year upsell isn't collapsed when the
			 * sticky area reaches the bottom of its grid cell.
			 */
			.checkout__summary-area > * {
				flex-shrink: 0;
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		! props.isLargeViewport &&
		css`
			grid-template-areas:
				'checkout-title-area'
				'sidebar-content'
				'main-content'
				'processor-notice'
				'trust-cards';
			.checkout-sidebar-content {
				background: ${ colorStudio.colors[ 'White' ] };
			}
			.checkout__summary-area {
				background: #f5f5f5;
				border: 1px solid ${ colorStudio.colors[ 'Gray 10' ] };
				border-radius: 8px;
				margin: 12px 16px;
				overflow: hidden;
				width: calc( 100% - 32px );
			}
			.checkout__summary-button {
				background: transparent;
				border-bottom: none;
			}
			.checkout__summary-body {
				padding-block-start: 0;
			}
			.wp-checkout-order-summary__section-title {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 10' ] };
				padding-top: 20px;
			}
			.checkout__redesign-header {
				grid-area: checkout-title-area;
				margin-top: var( --masterbar-checkout-height );
				margin-bottom: 12px;
				padding-inline: 16px;
			}
			.checkout-sidebar-content {
				margin-top: 0;
			}
			.checkout-main-content .checkout__main-title {
				display: none;
			}
			.checkout-main-content {
				margin-top: 12px;
			}
			.wp-checkout__review-order-step {
				padding-block-start: 0;
			}
			.checkout-step {
				padding: 16px 16px 48px 16px;
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		css`
			.checkout__main-title,
			.step-container-v2__heading h1 {
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 100' ] };

				@media ( max-width: 699px ) {
					font-size: 28px;
				}
			}
			.checkout__summary-card {
				background: transparent;
				box-shadow: none;
				padding: 0;
				margin-bottom: 0;
			}
			@media ( ${ props.theme.breakpoints.desktopUp } ) {
				.checkout__summary-card {
					background: ${ colorStudio.colors[ 'White' ] };
					border: 1px solid ${ colorStudio.colors[ 'Gray 5' ] };
					border-radius: 8px;
					padding: 24px;
				}
			}
			.promo-card.checkout-sidebar-plan-upsell {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
				border-radius: 8px;
				margin: 0;
				max-width: none;
				width: 100%;
			}
			.checkout-sidebar-plan-upsell__plan-grid > div {
				border-top: none;
			}
			.item-variation-picker {
				background: #ffffff;
				border: 1px solid #e0e0e0;
				border-radius: 8px;
				overflow: hidden;
				padding: 0;
			}
			.item-variation-picker > li {
				margin: 0;
				border-bottom: 1px solid #f0f0f0;
			}
			.item-variation-picker > li:last-child {
				border-bottom: none;
			}
			.item-variation-picker > li > div.is-checked {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
			}
			.item-variation-picker > li > div::before,
			.item-variation-picker > li > div:hover::before {
				border: none;
			}
			.item-variation-picker > li > div > label {
					min-height: 64px;
					padding-top: 2px;
					padding-bottom: 0;
				@media ( ${ props.theme.breakpoints.desktopUp } ) {
					min-height: 72px;
				}
			}
			.checkout-step__stepper > div > div:first-child {
				border: 1px solid ${ colorStudio.colors[ 'Gray 90' ] };
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-weight: 600;
			}
			.checkout-payment-methods {
				background: #ffffff;
				border: 1px solid #e0e0e0;
				border-radius: 8px;
				overflow: hidden;
				padding-top: 0;
			}
			.checkout-payment-methods .has-highlight,
			.item-variation-picker > li > div {
				border-radius: 0;
			}
			.checkout-payment-methods .has-highlight {
				margin: 0;
				border-bottom: 1px solid #f0f0f0;
			}
			.checkout-payment-methods .has-highlight:last-child {
				border-bottom: none;
			}
			.checkout-payment-methods .has-highlight.is-checked {
				background: linear-gradient( 135deg, rgba( 255, 255, 255, 0 ) 0%, #fff 50%, #e6f1ff 100% );
			}
			.checkout-payment-methods .has-highlight::before,
			.checkout-payment-methods .has-highlight:hover::before {
				border: none;
			}
			.checkout-payment-methods .has-highlight > label {
				font-size: 13px;
				font-weight: 400;
			}
			.checkout-payment-methods .payment-logos {
				display: flex;
				filter: none;
			}
			.checkout-payment-methods .StripeElement {
				background-color: field;
			}
			div:has( > .credit-card-fields-inner-wrapper ) {
				padding: 0 16px 16px 16px;
			}
			.checkout-steps__step-complete-content .checkout-payment-methods {
				background: white;
				padding: 12px 16px;
				min-height: 52px;
				display: flex;
				align-items: center;
				box-sizing: border-box;
				font-size: 15px;
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 90' ] };
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content {
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 90' ] };
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content ul:empty {
				display: none;
			}
			.checkout-contact-form-step .checkout-steps__step-complete-content ul {
				margin-top: 0;
			}
			.checkout-step__edit-button {
				padding: 4px;
				display: flex;
				align-items: center;
				line-height: 1;
			}

			.checkout-step__header h2 > span {
				color: ${ colorStudio.colors[ 'Gray 100' ] };
				font-size: 18px;
					@media ( ${ props.theme.breakpoints.desktopUp } ) {
						font-size: 20px;
					}
				}

			.checkout-step__header {
				margin-bottom: 16px;
			}

			.wp-checkout__review-order-step .checkout-step__header {
				margin-bottom: 0;
			}

			.checkout-line-item {
				padding-top: 24px;
				padding-bottom: 0;
			}

			.wp-checkout__review-order-step .checkout-step__header h2 > span {
				font-weight: 500;
			}
			.wp-checkout-order-review__show-coupon-field-button {
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-weight: 500;
				text-decoration: none;
			}
			div:has( > div > .wp-checkout-order-review__show-coupon-field-button ) {
				margin-block-start: -4px;
				padding-block-start: 0;
			}
			.wp-checkout__review-order-step .checkout-step__stepper {
				@media ( max-width: 699px ) {
					display: none;
				}
			}
			.wp-checkout__review-order-step .checkout-step__header h2 {
				font-size: 20px;
			}
			.wp-checkout__review-order-step .checkout-line-item {
				font-size: 15px;
			}
			.wp-checkout__review-order-step .order-review-line-items {
				margin-top: 0;
			}
			.wp-checkout__review-order-step .checkout-review-order__site {
				font-size: 14px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 50' ] };
				@media ( ${ props.theme.breakpoints.tabletUp } ) {
					margin-top: 0;
				}
			}
			.checkout-contact-form-step .checkout-steps__step-content > p {
				font-size: 12px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 40' ] };
			}
			.checkout__terms strong {
				font-size: 16px;
				font-weight: 500;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout__terms-item {
				font-size: 12px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 40' ] };
			}
			.checkout__summary-title {
				font-size: 13px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 100' ] };
			}
			.checkout__summary-body {
				color: ${ colorStudio.colors[ 'Gray 70' ] };
			}
			.wp-checkout-order-summary__subtotal,
			.wp-checkout-order-summary__total {
				color: ${ colorStudio.colors[ 'Gray 90' ] };
				font-size: 16px;
				line-height: 20px;
				margin-bottom: 0;
			}
			.wp-checkout-order-summary__subtotal:first-child,
			.wp-checkout-order-summary__total:first-child {
				margin-bottom: 4px;
			}
			.wp-checkout-order-summary__subtotal .wp-checkout-order-summary__subtotal-price {
				font-size: 14px;
			}
			.wp-checkout-order-summary__line-item,
			.wp-checkout-order-summary__tax-not-calculated {
				font-size: 13px;
			}
			.wp-checkout-order-summary__section-title {
				margin-bottom: 0;
			}
			.wp-checkout-order-summary__section-title > span {
				display: none;
			}
			.cost-overrides-list-product-wrapper,
			:has( > .cost-overrides-list-item--coupon ) {
				padding-inline-start: 0;
			}
			.cost-overrides-list-product-wrapper > svg[aria-hidden='true'],
			:has( > .cost-overrides-list-item--coupon ) > svg[aria-hidden='true'] {
				display: none;
			}
			.wp-checkout-order-summary__amount-wrapper {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 5' ] };
			}
			.wp-checkout-order-summary__subtotal-section {
				border-top: 0;
				border-bottom: 1px dashed ${ colorStudio.colors[ 'Gray 5' ] };S
			}
			.checkout-terms-and-checkboxes {
				padding-block-start: 24px;
			}
			.checkout-terms-and-checkboxes > *:first-child {
				border-top: 1px dashed ${ colorStudio.colors[ 'Gray 5' ] };
			}
			.checkout-steps__submit-footer-wrapper > div {
				margin-top: 8px;
			}
			.checkout-steps__submit-footer-wrapper > div > svg {
				display: none;
			}
			.checkout-steps__submit-footer-wrapper > div > p {
				font-size: 13px;
				font-weight: 400;
				color: ${ colorStudio.colors[ 'Gray 70' ] };
			}
		` }
	${ ( props ) =>
		props.isCheckoutUiRedesignV1 &&
		props.isLargeViewport &&
		css`
			.checkout__summary-area {
				padding-top: 50px;
			}
			div:has( > div > .wp-checkout-order-review__show-coupon-field-button ) {
				padding-block-start: 24px;
			}
		` }
`;

const WPCheckoutCompletedWrapper = styled.div`
	background: ${ colorStudio.colors[ 'White' ] };
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

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0 24px;
		max-width: 648px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-top: calc( var( --masterbar-checkout-height ) + 24px );
		max-width: 688px;
		padding-block: 0;
		padding-inline-start: 24px;
		padding-inline-end: 64px;
	}

	/* On narrower desktops the 64px between form and sidebar is too tight
	   when stacked with the sidebar's own 64px left padding. Drop the form's
	   right padding so its content reaches col-2's right edge, matching the
	   trust cards row beneath. Restored above 1024px where the layout has
	   room to breathe. */
	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) and ( max-width: 1024px ) {
		padding-inline-end: 0;
	}
	${ ( props ) => css`
		.checkout-line-item .checkout-line-item__remove-product {
			font-size: 14px;
		}
		.form-fieldset.contact-details-form-fields .form__hidden-input a {
			font-weight: 500;
			text-decoration: none;
			color: ${ props.theme.colors.textColorDark };
			font-size: 14px;
		}
		.form-fieldset.contact-details-form-fields .contact-details-form-fields__row,
		.form-fieldset.contact-details-form-fields .custom-form-fieldsets__address-fields {
			gap: 10px;
		}
		.form-fieldset.contact-details-form-fields .contact-details-form-fields__field {
			margin-bottom: 10px;
		}
		.checkout-terms-and-checkboxes a {
			color: ${ props.theme.colors.textColorDark };
		}
	` }
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
	margin-top: var( --masterbar-checkout-height );

	@media ( ${ ( props ) => props.theme.breakpoints.bigPhoneUp } ) {
		margin-top: var( --masterbar-checkout-height );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-top: 0;
		background: ${ colorStudio.colors[ 'White' ] };
		padding: 144px 24px 24px 64px;

		.rtl & {
			padding: 144px 64px 24px 24px;
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

// Redesign V1 styled components for summary header
const CheckoutSummaryTitleLinkRedesign = styled.button`
	background: transparent;
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: none;
	}
`;

const CheckoutSummaryTitleContentRedesign = styled.span`
	color: ${ ( props ) => props.theme.colors.textColor };
	display: flex;
	font-size: 13px;
	font-weight: 400;
	justify-content: space-between;
	align-items: center;
	margin: 0 auto;
	padding: 16px;
	max-width: 600px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 16px 0;
	}
`;

const CheckoutSummaryPricesWrapper = styled.span`
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 4px;
`;

const CheckoutSummaryOriginalPrice = styled.s`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-weight: ${ ( props ) => props.theme.weights.normal };
	font-size: 13px;
`;

const CheckoutSummaryCurrentPrice = styled.span`
	font-weight: ${ ( props ) => props.theme.weights.bold };
`;

const CheckoutSummaryBagIconWrapper = styled.span`
	opacity: 0.5;
	display: flex;
	align-items: center;
	margin-inline-end: 6px;
	& svg {
		width: 16px;
		height: 16px;
	}
`;

const CheckoutSummaryNudgeArea = styled.div`
	margin: 8px 16px 12px;
	flex-shrink: 0;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-inline: 0;
		margin-block-start: 24px;
		max-width: 288px;
	}
`;
