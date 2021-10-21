import { useStripe } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import {
	CheckoutProvider,
	CheckoutStepAreaWrapper,
	MainContentWrapper,
	SubmitButtonWrapper,
	checkoutTheme,
	defaultRegistry,
	Button,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useIsWebPayAvailable, isValueTruthy } from '@automattic/wpcom-checkout';
import { ThemeProvider } from '@emotion/react';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { Fragment, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import wp from 'calypso/lib/wp';
import useSiteDomains from 'calypso/my-sites/checkout/composite-checkout/hooks/use-site-domains';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { updateContactDetailsCache } from 'calypso/state/domains/management/actions';
import { errorNotice, infoNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import EmptyCart from './components/empty-cart';
import WPCheckout from './components/wp-checkout';
import useActOnceOnStrings from './hooks/use-act-once-on-strings';
import useAddProductsFromUrl from './hooks/use-add-products-from-url';
import useCachedDomainContactDetails from './hooks/use-cached-domain-contact-details';
import useCheckoutFlowTrackKey from './hooks/use-checkout-flow-track-key';
import useCountryList from './hooks/use-country-list';
import useCreatePaymentCompleteCallback from './hooks/use-create-payment-complete-callback';
import useCreatePaymentMethods from './hooks/use-create-payment-methods';
import useDetectedCountryCode from './hooks/use-detected-country-code';
import useGetThankYouUrl from './hooks/use-get-thank-you-url';
import useMaybeJetpackIntroCouponCode from './hooks/use-maybe-jetpack-intro-coupon-code';
import usePrepareProductsForCart from './hooks/use-prepare-products-for-cart';
import useRecordCartLoaded from './hooks/use-record-cart-loaded';
import useRecordCheckoutLoaded from './hooks/use-record-checkout-loaded';
import useRemoveFromCartAndRedirect from './hooks/use-remove-from-cart-and-redirect';
import useStoredCards from './hooks/use-stored-cards';
import { useWpcomStore } from './hooks/wpcom-store';
import { logStashLoadErrorEventAction, logStashEventAction } from './lib/analytics';
import existingCardProcessor from './lib/existing-card-processor';
import filterAppropriatePaymentMethods from './lib/filter-appropriate-payment-methods';
import freePurchaseProcessor from './lib/free-purchase-processor';
import fullCreditsProcessor from './lib/full-credits-processor';
import genericRedirectProcessor from './lib/generic-redirect-processor';
import getContactDetailsType from './lib/get-contact-details-type';
import multiPartnerCardProcessor from './lib/multi-partner-card-processor';
import payPalProcessor from './lib/paypal-express-processor';
import { translateResponseCartToWPCOMCart } from './lib/translate-cart';
import weChatProcessor from './lib/we-chat-processor';
import webPayProcessor from './lib/web-pay-processor';
import createAnalyticsEventHandler from './record-analytics';
import { StoredCard } from './types/stored-cards';
import {
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from './types/wpcom-store-state';
import type { ReactStandardAction } from './types/analytics';
import type { PaymentProcessorOptions } from './types/payment-processors';
import type { CheckoutPageErrorCallback } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';
import type { ManagedContactDetails, CountryListItem } from '@automattic/wpcom-checkout';

const { colors } = colorStudio;
const debug = debugFactory( 'calypso:composite-checkout:composite-checkout' );

const { select, registerStore } = defaultRegistry;

const wpcomGetStoredCards = (): StoredCard[] => wp.req.get( { path: '/me/stored-cards' } );

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	productAliasFromUrl,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	couponCode: couponCodeFromUrl,
	isComingFromUpsell,
	isLoggedOutCart,
	isNoSiteCart,
	infoMessage,
	isInEditor,
	onAfterPaymentComplete,
	isFocusedLaunch,
	isJetpackCheckout,
	jetpackSiteSlug,
	jetpackPurchaseToken,
	isUserComingFromLoginForm,
}: {
	siteSlug: string | undefined;
	siteId: number | undefined;
	productAliasFromUrl?: string | undefined;
	overrideCountryList?: CountryListItem[];
	redirectTo?: string | undefined;
	feature?: string | undefined;
	plan?: string | undefined;
	purchaseId?: number | undefined;
	couponCode?: string | undefined;
	isComingFromUpsell?: boolean;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isInEditor?: boolean;
	infoMessage?: JSX.Element;
	onAfterPaymentComplete?: () => void;
	isFocusedLaunch?: boolean;
	isJetpackCheckout: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	isUserComingFromLoginForm?: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const isJetpackNotAtomic =
		useSelector(
			( state ) => siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
		) ||
		isJetpackCheckout ||
		false;
	const isPrivate = useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const createUserAndSiteBeforeTransaction =
		Boolean( isLoggedOutCart || isNoSiteCart ) && ! isJetpackCheckout;
	const reduxDispatch = useDispatch();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const recordEvent: ( action: ReactStandardAction ) => void = useCallback(
		createAnalyticsEventHandler( reduxDispatch ),
		[]
	);
	const isJetpackSitelessCheckout = isJetpackCheckout && ! jetpackSiteSlug;
	const updatedSiteSlug = isJetpackCheckout ? jetpackSiteSlug : siteSlug;

	const showErrorMessageBriefly = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			reduxDispatch(
				errorNotice( message || translate( 'An error occurred during your purchase.' ), {
					duration: 5000,
				} )
			);
		},
		[ reduxDispatch, translate ]
	);

	const checkoutFlow = useCheckoutFlowTrackKey( {
		hasJetpackSiteSlug: !! jetpackSiteSlug,
		isJetpackCheckout,
		isJetpackNotAtomic,
		isLoggedOutCart,
		isUserComingFromLoginForm,
	} );

	const countriesList = useCountryList( overrideCountryList || [] );

	const {
		productsForCart,
		isLoading: areCartProductsPreparing,
		error: cartProductPrepError,
	} = usePrepareProductsForCart( {
		productAliasFromUrl,
		purchaseId,
		isInEditor,
		isJetpackNotAtomic,
		isPrivate,
		siteSlug: updatedSiteSlug,
		isLoggedOutCart,
		isNoSiteCart,
		isJetpackCheckout,
		jetpackSiteSlug,
		jetpackPurchaseToken,
	} );

	const cartKey = useCartKey();
	const {
		couponStatus,
		applyCoupon,
		updateLocation,
		replaceProductInCart,
		replaceProductsInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
	} = useShoppingCart( cartKey );

	const maybeJetpackIntroCouponCode = useMaybeJetpackIntroCouponCode(
		productsForCart,
		couponStatus === 'applied'
	);

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		isJetpackSitelessCheckout,
		productsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl: couponCodeFromUrl || maybeJetpackIntroCouponCode,
		applyCoupon,
		addProductsToCart,
		replaceProductsInCart,
	} );

	useRecordCartLoaded( {
		responseCart,
		productsForCart,
		isInitialCartLoading,
	} );

	const { items, total, allowedPaymentMethods } = useMemo(
		() => translateResponseCartToWPCOMCart( responseCart ),
		[ responseCart ]
	);

	const domains = useSiteDomains( siteId );

	const getThankYouUrlBase = useGetThankYouUrl( {
		siteSlug: updatedSiteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart: responseCart,
		isJetpackNotAtomic,
		productAliasFromUrl,
		hideNudge: !! isComingFromUpsell,
		isInEditor,
		isJetpackCheckout,
		domains,
	} );

	const getThankYouUrl = useCallback( () => {
		const url = getThankYouUrlBase();
		recordEvent( {
			type: 'THANK_YOU_URL_GENERATED',
			payload: { url },
		} );
		return url;
	}, [ getThankYouUrlBase, recordEvent ] );

	const contactDetailsType = getContactDetailsType( responseCart );

	useWpcomStore(
		registerStore,
		applyContactDetailsRequiredMask(
			emptyManagedContactDetails,
			contactDetailsType === 'domain' ? domainRequiredContactDetails : taxRequiredContactDetails
		),
		updateContactDetailsCache
	);

	useDetectedCountryCode();
	useCachedDomainContactDetails( updateLocation, countriesList );

	// Record errors adding products to the cart
	useActOnceOnStrings( [ cartProductPrepError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) => {
			reduxDispatch(
				logStashEventAction( 'calypso_composite_checkout_products_load_error', {
					error_message: String( message ),
				} )
			);
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_products_load_error', {
					error_message: String( message ),
				} )
			);
		} );
	} );

	useActOnceOnStrings( [ cartLoadingError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'CART_ERROR', payload: { type: cartLoadingErrorType, message } } )
		);
	} );

	// Display errors. Note that we display all errors if any of them change,
	// because errorNotice() otherwise will remove the previously displayed
	// errors.
	const errorsToDisplay = [
		cartLoadingError,
		stripeLoadingError?.message,
		cartProductPrepError,
	].filter( isValueTruthy );
	useActOnceOnStrings( errorsToDisplay, () => {
		reduxDispatch(
			errorNotice( errorsToDisplay.map( ( message ) => <p key={ message }>{ message }</p> ) )
		);
	} );

	const errors = responseCart.messages?.errors ?? [];
	const areThereErrors =
		[ ...errors, cartLoadingError, cartProductPrepError ].filter( isValueTruthy ).length > 0;

	const siteSlugLoggedOutCart: string | undefined = select( 'wpcom' )?.getSiteSlug();
	const {
		isRemovingProductFromCart,
		removeProductFromCartAndMaybeRedirect,
	} = useRemoveFromCartAndRedirect(
		updatedSiteSlug,
		siteSlugLoggedOutCart,
		createUserAndSiteBeforeTransaction
	);

	const { storedCards, isLoading: isLoadingStoredCards, error: storedCardsError } = useStoredCards(
		wpcomGetStoredCards,
		Boolean( isLoggedOutCart )
	);

	useActOnceOnStrings( [ storedCardsError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'STORED_CARD_ERROR', payload: message } )
		);
	} );

	const {
		isApplePayAvailable,
		isGooglePayAvailable,
		isLoading: isWebPayLoading,
	} = useIsWebPayAvailable(
		stripe,
		stripeConfiguration,
		!! stripeLoadingError,
		responseCart.currency,
		responseCart.total_cost_integer
	);

	const paymentMethodObjects = useCreatePaymentMethods( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isApplePayAvailable,
		isGooglePayAvailable,
		isWebPayLoading,
		storedCards,
		siteSlug: updatedSiteSlug,
	} );
	debug( 'created payment method objects', paymentMethodObjects );

	// Once we pass paymentMethods into CompositeCheckout, we should try to avoid
	// changing them because it can cause awkward UX. Here we try to wait for
	// them to be all finished loading before we pass them along.
	const arePaymentMethodsLoading =
		responseCart.products.length < 1 ||
		isInitialCartLoading ||
		// Only wait for stored cards to load if we are using cards
		( allowedPaymentMethods.includes( 'card' ) && isLoadingStoredCards ) ||
		// Only wait for web pay to load if we are using web pay
		( allowedPaymentMethods.includes( 'web-pay' ) && isWebPayLoading );

	const contactDetails: ManagedContactDetails | undefined = select( 'wpcom' )?.getContactInfo();
	const countryCode: string = contactDetails?.countryCode?.value ?? '';

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				countryCode,
				allowedPaymentMethods,
				responseCart,
		  } );
	debug( 'filtered payment method objects', paymentMethods );

	const { analyticsPath, analyticsProps } = getAnalyticsPath(
		purchaseId,
		productAliasFromUrl,
		updatedSiteSlug,
		feature,
		plan,
		isJetpackCheckout,
		checkoutFlow
	);

	const products = useSelector( ( state ) => getProductsList( state ) );

	const changePlanLength = useCallback(
		( uuidToReplace, newProductSlug, newProductId ) => {
			recordEvent( {
				type: 'CART_CHANGE_PLAN_LENGTH',
				payload: { newProductSlug },
			} );
			replaceProductInCart( uuidToReplace, {
				product_slug: newProductSlug,
				product_id: newProductId,
			} );
		},
		[ replaceProductInCart, recordEvent ]
	);

	// Often products are added using just the product_slug but missing the
	// product_id; this adds it.
	const addItemWithEssentialProperties = useCallback(
		( cartItem ) => {
			const adjustedItem = fillInSingleCartItemAttributes( cartItem, products );
			recordAddEvent( adjustedItem );
			addProductsToCart( [ adjustedItem ] );
		},
		[ addProductsToCart, products ]
	);

	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const dataForProcessor: PaymentProcessorOptions = useMemo(
		() => ( {
			contactDetails,
			createUserAndSiteBeforeTransaction,
			getThankYouUrl,
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
			reduxDispatch,
			responseCart,
			siteId,
			siteSlug: updatedSiteSlug,
			stripeConfiguration,
			stripe,
		} ),
		[
			contactDetails,
			createUserAndSiteBeforeTransaction,
			getThankYouUrl,
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
			reduxDispatch,
			responseCart,
			siteId,
			stripe,
			stripeConfiguration,
			updatedSiteSlug,
		]
	);

	const paymentProcessors = useMemo(
		() => ( {
			'apple-pay': ( transactionData: unknown ) =>
				webPayProcessor( 'apple-pay', transactionData, dataForProcessor ),
			'google-pay': ( transactionData: unknown ) =>
				webPayProcessor( 'google-pay', transactionData, dataForProcessor ),
			'free-purchase': () => freePurchaseProcessor( dataForProcessor ),
			card: ( transactionData: unknown ) =>
				multiPartnerCardProcessor( transactionData, dataForProcessor ),
			alipay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'alipay', transactionData, dataForProcessor ),
			p24: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'p24', transactionData, dataForProcessor ),
			bancontact: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'bancontact', transactionData, dataForProcessor ),
			giropay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'giropay', transactionData, dataForProcessor ),
			wechat: ( transactionData: unknown ) => weChatProcessor( transactionData, dataForProcessor ),
			netbanking: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'netbanking', transactionData, dataForProcessor ),
			ideal: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'ideal', transactionData, dataForProcessor ),
			sofort: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'sofort', transactionData, dataForProcessor ),
			eps: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'eps', transactionData, dataForProcessor ),
			'ebanx-tef': ( transactionData: unknown ) =>
				genericRedirectProcessor( 'brazil-tef', transactionData, dataForProcessor ),
			'full-credits': () => fullCreditsProcessor( dataForProcessor ),
			'existing-card': ( transactionData: unknown ) =>
				existingCardProcessor( transactionData, dataForProcessor ),
			paypal: () => payPalProcessor( dataForProcessor ),
		} ),
		[ dataForProcessor ]
	);

	const jetpackColors = isJetpackNotAtomic
		? {
				primary: colors[ 'Jetpack Green' ],
				primaryBorder: colors[ 'Jetpack Green 80' ],
				primaryOver: colors[ 'Jetpack Green 60' ],
				success: colors[ 'Jetpack Green' ],
				discount: colors[ 'Jetpack Green' ],
				highlight: colors[ 'Blue 50' ],
				highlightBorder: colors[ 'Blue 80' ],
				highlightOver: colors[ 'Blue 60' ],
		  }
		: {};
	const theme = { ...checkoutTheme, colors: { ...checkoutTheme.colors, ...jetpackColors } };

	const isLoading: boolean =
		isInitialCartLoading ||
		arePaymentMethodsLoading ||
		paymentMethods.length < 1 ||
		responseCart.products.length < 1;
	if ( isLoading ) {
		debug( 'still loading because one of these is true', {
			isInitialCartLoading,
			paymentMethods: paymentMethods.length < 1,
			arePaymentMethodsLoading: arePaymentMethodsLoading,
			items: responseCart.products.length < 1,
		} );
	} else {
		debug( 'no longer loading' );
	}

	useRecordCheckoutLoaded( {
		isLoading,
		isApplePayAvailable,
		responseCart,
		storedCards,
		productAliasFromUrl,
		checkoutFlow,
	} );

	const onPageLoadError: CheckoutPageErrorCallback = useCallback(
		( errorType, errorMessage, errorData ) => {
			reduxDispatch( logStashLoadErrorEventAction( errorType, errorMessage, errorData ) );
			function errorTypeToTracksEventName( type: string ): string {
				switch ( type ) {
					case 'page_load':
						return 'calypso_checkout_composite_page_load_error';
					case 'step_load':
						return 'calypso_checkout_composite_step_load_error';
					case 'submit_button_load':
						return 'calypso_checkout_composite_submit_button_load_error';
					case 'payment_method_load':
						return 'calypso_checkout_composite_payment_method_load_error';
					default:
						// These are important so we might as well use something that we'll
						// notice even if we don't recognize the event.
						return 'calypso_checkout_composite_page_load_error';
				}
			}
			reduxDispatch(
				recordTracksEvent( errorTypeToTracksEventName( errorType ), {
					error_message: errorMessage,
					...errorData,
				} )
			);
		},
		[ reduxDispatch ]
	);

	const onPaymentComplete = useCreatePaymentCompleteCallback( {
		createUserAndSiteBeforeTransaction,
		productAliasFromUrl,
		redirectTo,
		purchaseId,
		feature,
		isInEditor,
		isComingFromUpsell,
		isFocusedLaunch,
		siteSlug: updatedSiteSlug,
		isJetpackCheckout,
		checkoutFlow,
	} );

	const handlePaymentComplete = useCallback(
		( args ) => {
			onPaymentComplete?.( args );
			onAfterPaymentComplete?.();
		},
		[ onPaymentComplete, onAfterPaymentComplete ]
	);

	const handlePaymentError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			reduxDispatch(
				errorNotice( transactionError || translate( 'An error occurred during your purchase.' ) )
			);
		},
		[ reduxDispatch, translate ]
	);

	const handlePaymentRedirect = useCallback( () => {
		reduxDispatch( infoNotice( translate( 'Redirecting to payment partner…' ) ) );
	}, [ reduxDispatch, translate ] );

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
		const goToPlans = () => {
			recordEvent( {
				type: 'EMPTY_CART_CTA_CLICKED',
			} );
			if ( updatedSiteSlug ) {
				page( `/plans/${ updatedSiteSlug }` );
			} else {
				page( '/plans' );
			}
		};
		return (
			<Fragment>
				<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
				<ThemeProvider theme={ theme }>
					<MainContentWrapper>
						<CheckoutStepAreaWrapper>
							<EmptyCart />
							<SubmitButtonWrapper>
								<Button buttonType="primary" fullWidth onClick={ goToPlans }>
									{ translate( 'Browse our plans' ) }
								</Button>
							</SubmitButtonWrapper>
						</CheckoutStepAreaWrapper>
					</MainContentWrapper>
				</ThemeProvider>
			</Fragment>
		);
	}

	const updatedSiteId = isJetpackCheckout ? parseInt( String( responseCart.blog_id ), 10 ) : siteId;

	return (
		<Fragment>
			<QueryJetpackSaleCoupon />
			<QuerySitePlans siteId={ updatedSiteId } />
			<QuerySitePurchases siteId={ updatedSiteId } />
			<QueryPlans />
			<QueryProducts />
			<QueryContactDetailsCache />
			<PageViewTracker
				path={ analyticsPath }
				title="Checkout"
				properties={ analyticsProps }
				options={ { useJetpackGoogleAnalytics: isJetpackCheckout || isJetpackNotAtomic } }
			/>
			<CheckoutProvider
				items={ items }
				total={ total }
				onPaymentComplete={ handlePaymentComplete }
				onPaymentError={ handlePaymentError }
				onPaymentRedirect={ handlePaymentRedirect }
				onPageLoadError={ onPageLoadError }
				onEvent={ recordEvent }
				paymentMethods={ paymentMethods }
				paymentProcessors={ paymentProcessors }
				registry={ defaultRegistry }
				isLoading={ isLoading }
				isValidating={ isCartPendingUpdate }
				theme={ theme }
				initiallySelectedPaymentMethodId={ paymentMethods?.length ? paymentMethods[ 0 ].id : null }
			>
				<WPCheckout
					removeProductFromCart={ removeProductFromCartAndMaybeRedirect }
					changePlanLength={ changePlanLength }
					siteId={ updatedSiteId }
					siteUrl={ updatedSiteSlug }
					countriesList={ countriesList }
					addItemToCart={ addItemWithEssentialProperties }
					showErrorMessageBriefly={ showErrorMessageBriefly }
					isLoggedOutCart={ !! isLoggedOutCart }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					infoMessage={ infoMessage }
				/>
			</CheckoutProvider>
		</Fragment>
	);
}

function getAnalyticsPath(
	purchaseId: number | undefined,
	product: string | undefined,
	selectedSiteSlug: string | undefined,
	selectedFeature: string | undefined,
	plan: string | undefined,
	isJetpackCheckout: boolean,
	checkoutFlow: string
): { analyticsPath: string; analyticsProps: Record< string, string > } {
	debug( 'getAnalyticsPath', {
		purchaseId,
		product,
		selectedSiteSlug,
		selectedFeature,
		plan,
		isJetpackCheckout,
		checkoutFlow,
	} );
	let analyticsPath = '';
	let analyticsProps = {};

	if ( purchaseId && product ) {
		analyticsPath = '/checkout/:product/renew/:purchase_id/:site';
		analyticsProps = { product, purchase_id: purchaseId, site: selectedSiteSlug };
	} else if ( selectedFeature && plan ) {
		analyticsPath = '/checkout/features/:feature/:site/:plan';
		analyticsProps = { feature: selectedFeature, plan, site: selectedSiteSlug };
	} else if ( selectedFeature && ! plan ) {
		analyticsPath = '/checkout/features/:feature/:site';
		analyticsProps = { feature: selectedFeature, site: selectedSiteSlug };
	} else if ( product && selectedSiteSlug && ! purchaseId ) {
		analyticsPath = '/checkout/:site/:product';
		analyticsProps = { product, site: selectedSiteSlug, checkout_flow: checkoutFlow };
	} else if ( selectedSiteSlug ) {
		analyticsPath = '/checkout/:site';
		analyticsProps = { site: selectedSiteSlug };
	} else if ( product && ! selectedSiteSlug ) {
		analyticsPath = '/checkout/:product';
		analyticsProps = { product, checkout_flow: checkoutFlow };
	} else {
		analyticsPath = '/checkout/no-site';
	}

	if ( isJetpackCheckout ) {
		analyticsPath = analyticsPath.replace( 'checkout', 'checkout/jetpack' );
	}

	return { analyticsPath, analyticsProps };
}

function shouldShowEmptyCartPage( {
	responseCart,
	areWeRedirecting,
	areThereErrors,
	isCartPendingUpdate,
	isInitialCartLoading,
}: {
	responseCart: ResponseCart;
	areWeRedirecting: boolean;
	areThereErrors: boolean;
	isCartPendingUpdate: boolean;
	isInitialCartLoading: boolean;
} ): boolean {
	if ( responseCart.products.length > 0 ) {
		return false;
	}
	if ( areWeRedirecting ) {
		return false;
	}
	if ( areThereErrors ) {
		return true;
	}
	if ( isCartPendingUpdate ) {
		return false;
	}
	if ( isInitialCartLoading ) {
		return false;
	}
	return true;
}
