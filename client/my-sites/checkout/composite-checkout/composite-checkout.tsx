/**
 * External dependencies
 */
import page from 'page';
import React, { useCallback, useMemo } from 'react';
import { useTranslate } from 'i18n-calypso';
import debugFactory from 'debug';
import { useSelector, useDispatch } from 'react-redux';
import {
	CheckoutProvider,
	CheckoutStepAreaWrapper,
	MainContentWrapper,
	SubmitButtonWrapper,
	checkoutTheme,
	defaultRegistry,
	Button,
} from '@automattic/composite-checkout';
import { ThemeProvider } from 'emotion-theming';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import colorStudio from '@automattic/color-studio';
import { useStripe } from '@automattic/calypso-stripe';
import type { PaymentCompleteCallbackArguments } from '@automattic/composite-checkout';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { updateContactDetailsCache } from 'calypso/state/domains/management/actions';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { getPlan } from '@automattic/calypso-products';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { errorNotice, infoNotice, successNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProducts from 'calypso/components/data/query-products-list';
import useIsApplePayAvailable from './hooks/use-is-apple-pay-available';
import filterAppropriatePaymentMethods from './lib/filter-appropriate-payment-methods';
import useStoredCards from './hooks/use-stored-cards';
import usePrepareProductsForCart from './hooks/use-prepare-products-for-cart';
import useCreatePaymentMethods from './hooks/use-create-payment-methods';
import applePayProcessor from './lib/apple-pay-processor';
import multiPartnerCardProcessor from './lib/multi-partner-card-processor';
import freePurchaseProcessor from './lib/free-purchase-processor';
import fullCreditsProcessor from './lib/full-credits-processor';
import weChatProcessor from './lib/we-chat-processor';
import genericRedirectProcessor from './lib/generic-redirect-processor';
import existingCardProcessor from './lib/existing-card-processor';
import payPalProcessor from './lib/paypal-express-processor';
import useGetThankYouUrl from './hooks/use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import { useProductVariants } from './hooks/product-variants';
import { translateResponseCartToWPCOMCart } from './lib/translate-cart';
import useCountryList from './hooks/use-country-list';
import useCachedDomainContactDetails from './hooks/use-cached-domain-contact-details';
import useActOnceOnStrings from './hooks/use-act-once-on-strings';
import useRemoveFromCartAndRedirect from './hooks/use-remove-from-cart-and-redirect';
import useRecordCheckoutLoaded from './hooks/use-record-checkout-loaded';
import useRecordCartLoaded from './hooks/use-record-cart-loaded';
import useAddProductsFromUrl from './hooks/use-add-products-from-url';
import useDetectedCountryCode from './hooks/use-detected-country-code';
import WPCheckout from './components/wp-checkout';
import { useWpcomStore } from './hooks/wpcom-store';
import {
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
} from './types/wpcom-store-state';
import { StoredCard } from './types/stored-cards';
import { CountryListItem } from './types/country-list-item';
import doesValueExist from './lib/does-value-exist';
import EmptyCart from './components/empty-cart';
import getContactDetailsType from './lib/get-contact-details-type';
import getDomainDetails from './lib/get-domain-details';
import getPostalCode from './lib/get-postal-code';
import mergeIfObjects from './lib/merge-if-objects';
import type { ReactStandardAction } from './types/analytics';
import useCreatePaymentCompleteCallback from './hooks/use-create-payment-complete-callback';
import useMaybeJetpackIntroCouponCode from './hooks/use-maybe-jetpack-intro-coupon-code';
import type { PaymentProcessorOptions } from './types/payment-processors';

const { colors } = colorStudio;
const debug = debugFactory( 'calypso:composite-checkout:composite-checkout' );

const { select, registerStore } = defaultRegistry;

const wpcom = wp.undocumented();

// Aliasing wpcom functions explicitly bound to wpcom is required here;
// otherwise we get `this is not defined` errors.
const wpcomGetStoredCards = (): StoredCard[] => wpcom.getStoredCards();

export default function CompositeCheckout( {
	siteSlug,
	siteId,
	productAliasFromUrl,
	getStoredCards,
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
	isJetpackUserlessCheckout,
	jetpackSiteSlug,
}: {
	siteSlug: string | undefined;
	siteId: number | undefined;
	productAliasFromUrl?: string | undefined;
	getStoredCards?: () => StoredCard[];
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
	isJetpackUserlessCheckout?: boolean;
	jetpackSiteSlug?: string;
} ): JSX.Element {
	const translate = useTranslate();
	const isJetpackNotAtomic =
		useSelector(
			( state ) => siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId )
		) || false;
	const isPrivate = useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const createUserAndSiteBeforeTransaction = Boolean( isLoggedOutCart || isNoSiteCart );
	const reduxDispatch = useDispatch();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const recordEvent: ( action: ReactStandardAction ) => void = useCallback(
		createAnalyticsEventHandler( reduxDispatch ),
		[]
	);

	const showErrorMessage = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			reduxDispatch(
				errorNotice( message || translate( 'An error occurred during your purchase.' ) )
			);
		},
		[ reduxDispatch, translate ]
	);

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

	const showInfoMessage = useCallback(
		( message ) => {
			debug( 'info', message );
			reduxDispatch( infoNotice( message ) );
		},
		[ reduxDispatch ]
	);

	const showSuccessMessage = useCallback(
		( message ) => {
			debug( 'success', message );
			reduxDispatch( successNotice( message ) );
		},
		[ reduxDispatch ]
	);

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
		siteSlug,
		isLoggedOutCart,
		isNoSiteCart,
		isJetpackUserlessCheckout,
		jetpackSiteSlug,
	} );

	const {
		couponStatus,
		applyCoupon,
		updateLocation,
		replaceProductInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
	} = useShoppingCart();

	const maybeJetpackIntroCouponCode = useMaybeJetpackIntroCouponCode(
		productsForCart,
		couponStatus === 'applied'
	);

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		productsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl: couponCodeFromUrl || maybeJetpackIntroCouponCode,
		applyCoupon,
		addProductsToCart,
	} );

	useRecordCartLoaded( {
		recordEvent,
		responseCart,
		productsForCart,
		isInitialCartLoading,
	} );

	const { items, total, allowedPaymentMethods } = useMemo(
		() => translateResponseCartToWPCOMCart( responseCart ),
		[ responseCart ]
	);

	const getThankYouUrlBase = useGetThankYouUrl( {
		siteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart: responseCart,
		isJetpackNotAtomic,
		productAliasFromUrl,
		hideNudge: !! isComingFromUpsell,
		isInEditor,
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
	useCachedDomainContactDetails( updateLocation );

	// Record errors adding products to the cart
	useActOnceOnStrings( [ cartProductPrepError ].filter( doesValueExist ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'PRODUCTS_ADD_ERROR', payload: message } )
		);
	} );

	useActOnceOnStrings( [ cartLoadingError ].filter( doesValueExist ), ( messages ) => {
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
	].filter( doesValueExist );
	useActOnceOnStrings( errorsToDisplay, () => {
		reduxDispatch(
			errorNotice( errorsToDisplay.map( ( message ) => <p key={ message }>{ message }</p> ) )
		);
	} );

	const errors = responseCart.messages?.errors ?? [];
	const areThereErrors =
		[ ...errors, cartLoadingError, cartProductPrepError ].filter( doesValueExist ).length > 0;

	const siteSlugLoggedOutCart: string | undefined = select( 'wpcom' )?.getSiteSlug();
	const {
		isRemovingProductFromCart,
		removeProductFromCartAndMaybeRedirect,
	} = useRemoveFromCartAndRedirect(
		siteSlug,
		siteSlugLoggedOutCart,
		createUserAndSiteBeforeTransaction
	);

	const { storedCards, isLoading: isLoadingStoredCards, error: storedCardsError } = useStoredCards(
		getStoredCards || wpcomGetStoredCards,
		Boolean( isLoggedOutCart )
	);

	useActOnceOnStrings( [ storedCardsError ].filter( doesValueExist ), ( messages ) => {
		messages.forEach( ( message ) =>
			recordEvent( { type: 'STORED_CARD_ERROR', payload: message } )
		);
	} );

	const {
		canMakePayment: isApplePayAvailable,
		isLoading: isApplePayLoading,
	} = useIsApplePayAvailable(
		stripe,
		stripeConfiguration,
		!! stripeLoadingError,
		responseCart.currency
	);

	const paymentMethodObjects = useCreatePaymentMethods( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isApplePayAvailable,
		isApplePayLoading,
		storedCards,
		siteSlug,
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
		// Only wait for apple pay to load if we are using apple pay
		( allowedPaymentMethods.includes( 'apple-pay' ) && isApplePayLoading );

	const contactDetails: ManagedContactDetails | undefined = select( 'wpcom' )?.getContactInfo();
	const countryCode: string = contactDetails?.countryCode?.value ?? '';
	const subdivisionCode: string = contactDetails?.state?.value ?? '';

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				countryCode,
				allowedPaymentMethods,
				responseCart,
		  } );
	debug( 'filtered payment method objects', paymentMethods );

	const planSlugs = getPlanProductSlugs( responseCart.products );
	const getItemVariants = useProductVariants( {
		siteId,
		productSlug: planSlugs.length > 0 ? planSlugs[ 0 ] : undefined,
	} );

	const { analyticsPath, analyticsProps } = getAnalyticsPath(
		purchaseId,
		productAliasFromUrl,
		siteSlug,
		feature,
		plan
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
			recordEvent( {
				type: 'CART_ADD_ITEM',
				payload: adjustedItem,
			} );
			addProductsToCart( [ adjustedItem ] );
		},
		[ addProductsToCart, products, recordEvent ]
	);

	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const dataForProcessor: PaymentProcessorOptions = useMemo(
		() => ( {
			createUserAndSiteBeforeTransaction,
			getThankYouUrl,
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
			reduxDispatch,
			responseCart,
			siteId,
			siteSlug,
			stripeConfiguration,
			contactDetails,
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
			siteSlug,
			stripeConfiguration,
		]
	);

	const domainDetails = getDomainDetails( contactDetails, {
		includeDomainDetails,
		includeGSuiteDetails,
	} );
	const postalCode = getPostalCode( contactDetails );

	const paymentProcessors = useMemo(
		() => ( {
			'apple-pay': ( transactionData: unknown ) =>
				applePayProcessor( transactionData, dataForProcessor ),
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
			id_wallet: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'id_wallet', transactionData, dataForProcessor ),
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
				existingCardProcessor(
					mergeIfObjects( transactionData, {
						country: countryCode,
						postalCode,
						subdivisionCode,
						siteId: siteId ? String( siteId ) : undefined,
						domainDetails,
					} ),
					dataForProcessor
				),
			paypal: () => payPalProcessor( dataForProcessor ),
		} ),
		[ siteId, dataForProcessor, countryCode, subdivisionCode, postalCode, domainDetails ]
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
	}

	useRecordCheckoutLoaded( {
		recordEvent,
		isLoading,
		isApplePayAvailable,
		responseCart,
		storedCards,
		productAliasFromUrl,
	} );

	const onPaymentComplete = useCreatePaymentCompleteCallback( {
		createUserAndSiteBeforeTransaction,
		productAliasFromUrl,
		redirectTo,
		purchaseId,
		feature,
		isInEditor,
		isComingFromUpsell,
		isFocusedLaunch,
	} );

	const handlePaymentComplete = useCallback(
		( args: PaymentCompleteCallbackArguments ) => {
			onPaymentComplete?.( args );
			onAfterPaymentComplete?.();
		},
		[ onPaymentComplete, onAfterPaymentComplete ]
	);

	if (
		shouldShowEmptyCartPage( {
			responseCart,
			areWeRedirecting: isRemovingProductFromCart,
			areThereErrors,
			isCartPendingUpdate,
			isInitialCartLoading,
		} )
	) {
		const goToPlans = () => {
			recordEvent( {
				type: 'EMPTY_CART_CTA_CLICKED',
			} );
			if ( siteSlug ) {
				page( `/plans/${ siteSlug }` );
			} else {
				page( '/plans' );
			}
		};
		return (
			<React.Fragment>
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
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<QuerySitePlans siteId={ siteId } />
			<QuerySitePurchases siteId={ siteId } />
			<QueryPlans />
			<QueryProducts />
			<QueryContactDetailsCache />
			<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
			<CheckoutProvider
				items={ items }
				total={ total }
				onPaymentComplete={ handlePaymentComplete }
				showErrorMessage={ showErrorMessage }
				showInfoMessage={ showInfoMessage }
				showSuccessMessage={ showSuccessMessage }
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
					siteId={ siteId }
					siteUrl={ siteSlug }
					countriesList={ countriesList }
					getItemVariants={ getItemVariants }
					addItemToCart={ addItemWithEssentialProperties }
					showErrorMessageBriefly={ showErrorMessageBriefly }
					isLoggedOutCart={ !! isLoggedOutCart }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					infoMessage={ infoMessage }
				/>
			</CheckoutProvider>
		</React.Fragment>
	);
}

function getPlanProductSlugs( items: ResponseCartProduct[] ): string[] {
	return items
		.filter( ( item ) => {
			return getPlan( item.product_slug );
		} )
		.map( ( item ) => item.product_slug );
}

function getAnalyticsPath(
	purchaseId: number | undefined,
	product: string | undefined,
	selectedSiteSlug: string | undefined,
	selectedFeature: string | undefined,
	plan: string | undefined
): { analyticsPath: string; analyticsProps: Record< string, string > } {
	debug( 'getAnalyticsPath', { purchaseId, product, selectedSiteSlug, selectedFeature, plan } );
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
	} else if ( product && ! purchaseId ) {
		analyticsPath = '/checkout/:site/:product';
		analyticsProps = { product, site: selectedSiteSlug };
	} else if ( selectedSiteSlug ) {
		analyticsPath = '/checkout/:site';
		analyticsProps = { site: selectedSiteSlug };
	} else {
		analyticsPath = '/checkout/no-site';
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
