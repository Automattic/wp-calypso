import {
	isYearly,
	isJetpackPurchasableItem,
	isMonthlyProduct,
	isBiennially,
	isTriennially,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import {
	Button,
	useTransactionStatus,
	TransactionStatus,
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
} from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/format-currency';
import { useLocale } from '@automattic/i18n-utils';
import { useShoppingCart } from '@automattic/shopping-cart';
import { styled, joinClasses, hasCheckoutVersion } from '@automattic/wpcom-checkout';
import { keyframes } from '@emotion/react';
import { useSelect, useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import i18n, { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import MaterialIcon from 'calypso/components/material-icon';
import isAkismetCheckout from 'calypso/lib/akismet/is-akismet-checkout';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
	hasDIFMProduct,
	has100YearPlan as cartHas100YearPlan,
	ObjectWithProducts,
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
import useOneDollarOfferTrack from 'calypso/my-sites/plans/hooks/use-onedollar-offer-track';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { saveContactDetailsCache } from 'calypso/state/domains/management/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import useCouponFieldState from '../hooks/use-coupon-field-state';
import { useShouldCollapseLastStep } from '../hooks/use-should-collapse-last-step';
import { useToSFoldableCard } from '../hooks/use-tos-foldable-card';
import { validateContactDetails } from '../lib/contact-validation';
import getContactDetailsType from '../lib/get-contact-details-type';
import { updateCartContactDetailsForCheckout } from '../lib/update-cart-contact-details-for-checkout';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import { CheckoutMoneyBackGuarantee } from './CheckoutMoneyBackGuarantee';
import AcceptTermsOfServiceCheckbox from './accept-terms-of-service-checkbox';
import badge14Src from './assets/icons/badge-14.svg';
import badge7Src from './assets/icons/badge-7.svg';
import badgeGenericSrc from './assets/icons/badge-generic.svg';
import badgeSecurity from './assets/icons/security.svg';
import { CheckoutCompleteRedirecting } from './checkout-complete-redirecting';
import CheckoutNextSteps from './checkout-next-steps';
import { CheckoutSidebarPlanUpsell } from './checkout-sidebar-plan-upsell';
import { CheckoutSlowProcessingNotice } from './checkout-slow-processing-notice';
import { EmptyCart, shouldShowEmptyCartPage } from './empty-cart';
import { GoogleDomainsCopy } from './google-transfers-copy';
import JetpackAkismetCheckoutSidebarPlanUpsell from './jetpack-akismet-checkout-sidebar-plan-upsell';
import BeforeSubmitCheckoutHeader from './payment-method-step';
import SecondaryCartPromotions from './secondary-cart-promotions';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import WPContactFormSummary from './wp-contact-form-summary';
import type { OnChangeItemVariant } from './item-variation-picker';
import type {
	CheckoutPageErrorCallback,
	StepChangedCallback,
} from '@automattic/composite-checkout';
import type { RemoveProductFromCart, MinimalRequestCartProduct } from '@automattic/shopping-cart';
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
		padding: 24px;
		box-sizing: border-box;
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		max-width: 328px;
		background: ${ ( props ) => props.theme.colors.surface };
		margin-top: 46px;
	}
`;

const pulse = keyframes`
	0% {
		opacity: 1;
	}

	70% {
		opacity: 0.5;
	}

	100% {
		opacity: 1;
	}
`;

const SideBarLoadingCopy = styled.p`
	font-size: 14px;
	height: 16px;
	content: '';
	background: ${ ( props ) => props.theme.colors.borderColorLight };
	color: ${ ( props ) => props.theme.colors.borderColorLight };
	margin: 8px 0 0 0;
	padding: 0;
	animation: ${ pulse } 2s ease-in-out infinite;
`;

function LoadingSidebarContent() {
	return (
		<LoadingSidebar>
			<SideBarLoadingCopy />
			<SideBarLoadingCopy />
			<SideBarLoadingCopy />
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

export default function WPCheckout( {
	addItemToCart,
	changeSelection,
	countriesList,
	createUserAndSiteBeforeTransaction,
	infoMessage,
	isLoggedOutCart,
	onPageLoadError,
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
}: {
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	changeSelection: OnChangeItemVariant;
	onStepChanged?: StepChangedCallback;
	countriesList: CountryListItem[];
	createUserAndSiteBeforeTransaction: boolean;
	infoMessage?: JSX.Element;
	isLoggedOutCart: boolean;
	onPageLoadError: CheckoutPageErrorCallback;
	removeProductFromCart: RemoveProductFromCart;
	showErrorMessageBriefly: ( error: string ) => void;
	siteId: number | undefined;
	siteUrl: string | undefined;
	isRemovingProductFromCart: boolean;
	areThereErrors: boolean;
	isInitialCartLoading: boolean;
	customizedPreviousPath?: string;
	loadingHeader?: ReactNode;
} ) {
	const locale = useLocale();
	const cartKey = useCartKey();
	const {
		responseCart,
		applyCoupon,
		updateLocation,
		replaceProductInCart,
		isPendingUpdate: isCartPendingUpdate,
	} = useShoppingCart( cartKey );
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const reduxDispatch = useReduxDispatch();
	usePresalesChat( getPresalesChatKey( responseCart ), responseCart?.products?.length > 0 );

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
	const shouldCollapseLastStep = useShouldCollapseLastStep();
	const showToSFoldableCard = useToSFoldableCard();

	const hasMarketplaceProduct = useSelector( ( state ) => {
		return responseCart?.products?.some( ( p ) => isMarketplaceProduct( state, p.product_slug ) );
	} );

	const has100YearPlan = cartHas100YearPlan( responseCart );

	const [ is3PDAccountConsentAccepted, setIs3PDAccountConsentAccepted ] = useState( false );
	const [ is100YearPlanTermsAccepted, setIs100YearPlanTermsAccepted ] = useState( false );
	const [ isSubmitted, setIsSubmitted ] = useState( false );

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

	if ( ! checkoutActions ) {
		return null;
	}

	const {
		touchContactFields,
		applyDomainContactValidationResults,
		clearDomainContactErrorMessages,
	} = checkoutActions;

	const isWcMobile = isWcMobileApp();

	if ( transactionStatus === TransactionStatus.COMPLETE ) {
		debug( 'rendering post-checkout redirecting page' );
		return (
			<WPCheckoutWrapper>
				<WPCheckoutSidebarContent></WPCheckoutSidebarContent>
				<WPCheckoutMainContent>
					<PerformanceTrackerStop />
					<WPCheckoutTitle>{ translate( 'Checkout' ) }</WPCheckoutTitle>
					<CheckoutCompleteRedirecting />
					<CheckoutFormSubmit
						submitButton={
							<Button buttonType="primary" fullWidth isBusy disabled>
								{ translate( 'Please wait…' ) }
							</Button>
						}
					/>
				</WPCheckoutMainContent>
			</WPCheckoutWrapper>
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

	const isDIFMInCart = hasDIFMProduct( responseCart );
	const hasMonthlyProduct = responseCart?.products?.some( isMonthlyProduct );

	const nextStepButtonText =
		locale.startsWith( 'en' ) || i18n.hasTranslation( 'Continue to payment' )
			? translate( 'Continue to payment', { textOnly: true } )
			: translate( 'Continue', { textOnly: true } );

	return (
		<WPCheckoutWrapper>
			<WPCheckoutSidebarContent>
				{ isLoading && <LoadingSidebarContent /> }
				{ formStatus === FormStatus.SUBMITTING && <CheckoutSlowProcessingNotice /> }
				{ ! isLoading && (
					<CheckoutSummaryArea className={ isSummaryVisible ? 'is-visible' : '' }>
						<CheckoutErrorBoundary
							errorMessage={ translate( 'Sorry, there was an error loading this information.' ) }
							onError={ onSummaryError }
						>
							<CheckoutSummaryTitleLink onClick={ () => setIsSummaryVisible( ! isSummaryVisible ) }>
								<CheckoutSummaryTitleContent>
									<CheckoutSummaryTitle>
										<CheckoutSummaryTitleIcon icon="info-outline" size={ 20 } />
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
								{ hasCheckoutVersion( '2' ) && (
									<WPCheckoutOrderReview
										removeProductFromCart={ removeProductFromCart }
										couponFieldStateProps={ couponFieldStateProps }
										onChangeSelection={ changeSelection }
										siteUrl={ siteUrl }
										createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
									/>
								) }

								<WPCheckoutOrderSummary
									siteId={ siteId }
									onChangeSelection={ changeSelection }
									nextDomainIsFree={ responseCart?.next_domain_is_free }
								/>
								{ ! isWcMobile && ! isDIFMInCart && ! hasMonthlyProduct && (
									<>
										<CheckoutSidebarPlanUpsell />
										<JetpackAkismetCheckoutSidebarPlanUpsell />
									</>
								) }
								<SecondaryCartPromotions
									responseCart={ responseCart }
									addItemToCart={ addItemToCart }
									isCartPendingUpdate={ isCartPendingUpdate }
								/>
								<CheckoutNextSteps responseCart={ responseCart } />
							</CheckoutSummaryBody>
						</CheckoutErrorBoundary>
					</CheckoutSummaryArea>
				) }
			</WPCheckoutSidebarContent>

			<WPCheckoutMainContent>
				<CheckoutOrderBanner />
				<WPCheckoutTitle>{ translate( 'Checkout' ) }</WPCheckoutTitle>
				<CheckoutStepGroup loadingHeader={ loadingHeader } onStepChanged={ onStepChanged }>
					<PerformanceTrackerStop />
					{ infoMessage }
					{ ! hasCheckoutVersion( '2' ) && (
						<CheckoutStepBody
							onError={ onReviewError }
							className="wp-checkout__review-order-step"
							stepId="review-order-step"
							isStepActive={ false }
							isStepComplete={ true }
							titleContent={ <OrderReviewTitle /> }
							completeStepContent={
								<WPCheckoutOrderReview
									removeProductFromCart={ removeProductFromCart }
									replaceProductInCart={ replaceProductInCart }
									couponFieldStateProps={ couponFieldStateProps }
									onChangeSelection={ changeSelection }
									siteUrl={ siteUrl }
									createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
								/>
							}
							formStatus={ formStatus }
						/>
					) }
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
									reduxDispatch(
										saveContactDetailsCache( prepareDomainContactValidationRequest( contactInfo ) )
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
						activeStepFooter={
							! shouldCollapseLastStep && (
								<>
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
								</>
							)
						}
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
							// Temporarily disabling this lint rule until hasCheckoutVersion is removed
							// eslint-disable-next-line no-nested-ternary
							hasCartJetpackProductsOnly ? (
								<JetpackCheckoutSeals />
							) : hasCheckoutVersion( '2' ) || showToSFoldableCard ? (
								<CheckoutMoneyBackGuarantee cart={ responseCart } />
							) : null
						}
					/>
				</CheckoutStepGroup>
			</WPCheckoutMainContent>
		</WPCheckoutWrapper>
	);
}

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
	display: none;
	margin: 0 auto;
	max-width: 600px;
	width: 100%;
	padding: 0 24px 25px;

	.is-visible & {
		display: block;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 0 0 25px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		display: block;
		max-width: 328px;
		padding: 0;

		& .card {
			box-shadow: none;
		}
	}
`;

const CheckoutTermsAndCheckboxesWrapper = styled.div`
	display: flex;
	flex-direction: column;
	padding: 32px 20px 0 24px;
	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		padding: 32px 20px 0 40px;
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
	const hasMarketplaceProduct = useSelector( ( state ) => {
		return responseCart.products.some( ( p ) => isMarketplaceProduct( state, p.product_slug ) );
	} );

	const translate = useTranslate();
	const shouldCollapseLastStep = useShouldCollapseLastStep();

	if ( ! shouldCollapseLastStep ) {
		return null;
	}
	return (
		<CheckoutTermsAndCheckboxesWrapper>
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

	padding: 1.5rem 1.5rem 0;

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
		padding: 144px 24px 0 64px;

		.rtl & {
			padding: 144px 64px 0 24px;
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
