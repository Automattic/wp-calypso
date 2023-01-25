import { isYearly, isJetpackPurchasableItem, isMonthlyProduct } from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import {
	MainContentWrapper,
	SubmitButtonWrapper,
	Button,
	useTransactionStatus,
	TransactionStatus,
	CheckoutStep,
	CheckoutStepGroup,
	CheckoutStepBody,
	CheckoutSummaryArea as CheckoutSummaryAreaUnstyled,
	useFormStatus,
	useIsStepActive,
	useIsStepComplete,
	useTotal,
	CheckoutErrorBoundary,
	CheckoutFormSubmit,
	PaymentMethodStep,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { styled } from '@automattic/wpcom-checkout';
import { useSelect, useDispatch } from '@wordpress/data';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import MaterialIcon from 'calypso/components/material-icon';
import {
	hasGoogleApps,
	hasDomainRegistration,
	hasTransferProduct,
	hasDIFMProduct,
} from 'calypso/lib/cart-values/cart-items';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { isWcMobileApp } from 'calypso/lib/mobile-app';
import useVatDetails from 'calypso/me/purchases/vat-info/use-vat-details';
import useValidCheckoutBackUrl from 'calypso/my-sites/checkout/composite-checkout/hooks/use-valid-checkout-back-url';
import { leaveCheckout } from 'calypso/my-sites/checkout/composite-checkout/lib/leave-checkout';
import { prepareDomainContactValidationRequest } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { saveContactDetailsCache } from 'calypso/state/domains/management/actions';
import { errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import useCouponFieldState from '../hooks/use-coupon-field-state';
import { validateContactDetails } from '../lib/contact-validation';
import getContactDetailsType from '../lib/get-contact-details-type';
import { updateCartContactDetailsForCheckout } from '../lib/update-cart-contact-details-for-checkout';
import badge14Src from './assets/icons/badge-14.svg';
import badge7Src from './assets/icons/badge-7.svg';
import badgeGenericSrc from './assets/icons/badge-generic.svg';
import { CheckoutCompleteRedirecting } from './checkout-complete-redirecting';
import CheckoutHelpLink from './checkout-help-link';
import CheckoutNextSteps from './checkout-next-steps';
import { CheckoutSidebarPlanUpsell } from './checkout-sidebar-plan-upsell';
import { EmptyCart, shouldShowEmptyCartPage } from './empty-cart';
import PaymentMethodStepContent from './payment-method-step';
import SecondaryCartPromotions from './secondary-cart-promotions';
import ThirdPartyDevsAccount from './third-party-plugins-developer-account';
import WPCheckoutOrderReview from './wp-checkout-order-review';
import WPCheckoutOrderSummary from './wp-checkout-order-summary';
import WPContactForm from './wp-contact-form';
import WPContactFormSummary from './wp-contact-form-summary';
import type { OnChangeItemVariant } from './item-variation-picker';
import type { CheckoutPageErrorCallback } from '@automattic/composite-checkout';
import type { RemoveProductFromCart, MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type {
	CountryListItem,
	ManagedContactDetails,
	VatDetails,
} from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:composite-checkout:wp-checkout' );

// This will make converting to TS less noisy. The order of components can be reorganized later
/* eslint-disable @typescript-eslint/no-use-before-define */

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

export default function WPCheckout( {
	addItemToCart,
	changePlanLength,
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
	forceRadioButtons,
}: {
	addItemToCart: ( item: MinimalRequestCartProduct ) => void;
	changePlanLength: OnChangeItemVariant;
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
	// TODO: This is just for unit tests. Remove forceRadioButtons everywhere
	// when calypso_checkout_variant_picker_radio_2212 ExPlat test completes.
	forceRadioButtons?: boolean;
} ) {
	const cartKey = useCartKey();
	const {
		responseCart,
		applyCoupon,
		updateLocation,
		isPendingUpdate: isCartPendingUpdate,
	} = useShoppingCart( cartKey );
	const translate = useTranslate();
	const couponFieldStateProps = useCouponFieldState( applyCoupon );
	const total = useTotal();
	const reduxDispatch = useReduxDispatch();

	const areThereDomainProductsInCart =
		hasDomainRegistration( responseCart ) || hasTransferProduct( responseCart );
	const isGSuiteInCart = hasGoogleApps( responseCart );

	const contactDetailsType = getContactDetailsType( responseCart );

	const contactInfo: ManagedContactDetails = useSelect( ( sel ) =>
		sel( 'wpcom-checkout' ).getContactInfo()
	);

	const vatDetails: VatDetails = useSelect( ( sel ) => sel( 'wpcom-checkout' ).getVatDetails() );
	const { setVatDetails } = useVatDetails();

	const {
		touchContactFields,
		applyDomainContactValidationResults,
		clearDomainContactErrorMessages,
	} = useDispatch( 'wpcom-checkout' );

	const [ shouldShowContactDetailsValidationErrors, setShouldShowContactDetailsValidationErrors ] =
		useState( true );

	// The "Summary" view is displayed in the sidebar at desktop (wide) widths
	// and before the first step at mobile (smaller) widths. At smaller widths it
	// starts collapsed and can be expanded; at wider widths (as a sidebar) it is
	// always visible. It is not a step and its visibility is managed manually.
	const [ isSummaryVisible, setIsSummaryVisible ] = useState( false );
	const { formStatus } = useFormStatus();

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

	const jetpackCheckoutBackUrl = useValidCheckoutBackUrl( siteUrl );
	const previousPath = useSelector( getPreviousRoute );
	const goToPreviousPage = () =>
		leaveCheckout( {
			siteSlug: siteUrl,
			jetpackCheckoutBackUrl,
			previousPath: customizedPreviousPath || previousPath,
			tracksEvent: 'calypso_checkout_composite_empty_cart_clicked',
		} );

	const { transactionStatus } = useTransactionStatus();

	const hasMarketplaceProduct = useSelector( ( state ) => {
		return responseCart?.products?.some( ( p ) => isMarketplaceProduct( state, p.product_slug ) );
	} );

	const [ is3PDAccountConsentAccepted, setIs3PDAccountConsentAccepted ] = useState( false );
	const [ isSubmitted, setIsSubmitted ] = useState( false );

	const validateForm = async () => {
		setIsSubmitted( true );
		if ( hasMarketplaceProduct && ! is3PDAccountConsentAccepted ) {
			return false;
		}
		return true;
	};

	const isWcMobile = isWcMobileApp();

	if ( transactionStatus === TransactionStatus.COMPLETE ) {
		debug( 'rendering post-checkout redirecting page' );
		return (
			<MainContentWrapper>
				<NonCheckoutContentWrapper>
					<NonCheckoutContentInnerWrapper>
						<CheckoutCompleteRedirecting />
						<SubmitButtonWrapper>
							<Button buttonType="primary" fullWidth isBusy disabled>
								{ translate( 'Please wait…' ) }
							</Button>
						</SubmitButtonWrapper>
					</NonCheckoutContentInnerWrapper>
				</NonCheckoutContentWrapper>
			</MainContentWrapper>
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
			<MainContentWrapper>
				<NonCheckoutContentWrapper>
					<NonCheckoutContentInnerWrapper>
						<EmptyCart />
						<SubmitButtonWrapper>
							<Button buttonType="primary" fullWidth onClick={ goToPreviousPage }>
								{ translate( 'Go back' ) }
							</Button>
						</SubmitButtonWrapper>
					</NonCheckoutContentInnerWrapper>
				</NonCheckoutContentWrapper>
			</MainContentWrapper>
		);
	}

	const isDIFMInCart = hasDIFMProduct( responseCart );

	return (
		<CheckoutStepGroup
			stepAreaHeader={
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
						<CheckoutSummaryBody className="checkout__summary-body">
							<WPCheckoutOrderSummary
								siteId={ siteId }
								onChangePlanLength={ changePlanLength }
								nextDomainIsFree={ responseCart?.next_domain_is_free }
							/>
							{ ! isWcMobile && ! isDIFMInCart && <CheckoutSidebarPlanUpsell /> }
							<SecondaryCartPromotions
								responseCart={ responseCart }
								addItemToCart={ addItemToCart }
								isCartPendingUpdate={ isCartPendingUpdate }
							/>
							<CheckoutHelpLink />
							<CheckoutNextSteps responseCart={ responseCart } />
						</CheckoutSummaryBody>
					</CheckoutErrorBoundary>
				</CheckoutSummaryArea>
			}
		>
			{ infoMessage }
			<CheckoutStepBody
				onError={ onReviewError }
				className="wp-checkout__review-order-step"
				stepId="review-order-step"
				isStepActive={ false }
				isStepComplete={ true }
				titleContent={ <OrderReviewTitle /> }
				completeStepContent={
					<WPCheckoutOrderReview
						forceRadioButtons={ forceRadioButtons }
						removeProductFromCart={ removeProductFromCart }
						couponFieldStateProps={ couponFieldStateProps }
						onChangePlanLength={ changePlanLength }
						siteUrl={ siteUrl }
						createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					/>
				}
				formStatus={ formStatus }
			/>
			{ contactDetailsType !== 'none' && (
				<CheckoutStep
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
								if ( vatDetails.id ) {
									await setVatDetails( vatDetails );
								}
							} catch ( error ) {
								reduxDispatch( removeNotice( 'vat_info_notice' ) );
								if ( shouldShowContactDetailsValidationErrors ) {
									reduxDispatch(
										errorNotice(
											translate(
												'Your VAT details are not valid. Please check each field and try again.'
											),
											{ id: 'vat_info_notice' }
										)
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
									vatDetails
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
							shouldShowContactDetailsValidationErrors={ shouldShowContactDetailsValidationErrors }
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
					nextStepButtonText={ String( translate( 'Continue' ) ) }
					nextStepButtonAriaLabel={ String(
						translate( 'Continue with the entered contact details' )
					) }
					validatingButtonText={ validatingButtonText }
					validatingButtonAriaLabel={ validatingButtonText }
				/>
			) }
			<PaymentMethodStep
				activeStepFooter={ <PaymentMethodStepContent /> }
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
			{ hasMarketplaceProduct && (
				<ThirdPartyDevsAccount
					isAccepted={ is3PDAccountConsentAccepted }
					onChange={ setIs3PDAccountConsentAccepted }
					isSubmitted={ isSubmitted }
				/>
			) }
			<CheckoutFormSubmit
				validateForm={ validateForm }
				submitButtonHeader={ <SubmitButtonHeader /> }
				submitButtonFooter={ <SubmitButtonFooter /> }
			/>
		</CheckoutStepGroup>
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
		overflow-y: auto;
		height: 100vh;
		& .card {
			border-left: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
			border-right: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		}
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

const SubmitButtonFooter = () => {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );
	const translate = useTranslate();

	const hasCartJetpackProductsOnly = responseCart?.products?.every( ( product ) =>
		isJetpackPurchasableItem( product.product_slug )
	);

	if ( ! hasCartJetpackProductsOnly ) {
		return null;
	}

	const show7DayGuarantee = responseCart?.products?.every( isMonthlyProduct );
	const show14DayGuarantee = responseCart?.products?.every( isYearly );
	const content =
		show7DayGuarantee || show14DayGuarantee ? (
			translate( '%(dayCount)s day money back guarantee', {
				args: {
					dayCount: show7DayGuarantee ? 7 : 14,
				},
			} )
		) : (
			<>
				{ translate( '14 day money back guarantee on yearly subscriptions' ) }
				<br />
				{ translate( '7 day money back guarantee on monthly subscriptions' ) }
			</>
		);
	let imgSrc = badgeGenericSrc;

	if ( show7DayGuarantee ) {
		imgSrc = badge7Src;
	} else if ( show14DayGuarantee ) {
		imgSrc = badge14Src;
	}

	return (
		<SubmitButtonFooterWrapper>
			<img src={ imgSrc } alt="" />
			<span>{ content }</span>
		</SubmitButtonFooterWrapper>
	);
};

const SubmitButtonFooterWrapper = styled.div< React.HTMLAttributes< HTMLDivElement > >`
	display: flex;
	justify-content: center;
	align-items: flex-start;

	margin-top: 1.25rem;

	color: ${ ( props ) => props.theme.colors.textColor };

	font-weight: 500;

	img {
		margin-right: 0.5rem;
	}

	span {
		padding-top: 3px;
	}
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

const NonCheckoutContentWrapper = styled.div`
	display: flex;

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		align-items: flex-start;
		flex-direction: row;
		justify-content: center;
		width: 100%;
	}
`;

const NonCheckoutContentInnerWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		max-width: 556px;
		margin: 0 auto;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
	}
`;
