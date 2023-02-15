import { JETPACK_SEARCH_PRODUCTS } from '@automattic/calypso-products';
import { useStripe } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import { CheckoutProvider, checkoutTheme } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QueryJetpackSaleCoupon from 'calypso/components/data/query-jetpack-sale-coupon';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryPostCounts from 'calypso/components/data/query-post-counts';
import QueryProducts from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import wp from 'calypso/lib/wp';
import useSiteDomains from 'calypso/my-sites/checkout/composite-checkout/hooks/use-site-domains';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
} from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, infoNotice } from 'calypso/state/notices/actions';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import useActOnceOnStrings from '../hooks/use-act-once-on-strings';
import useAddProductsFromUrl from '../hooks/use-add-products-from-url';
import useCheckoutFlowTrackKey from '../hooks/use-checkout-flow-track-key';
import useCountryList from '../hooks/use-country-list';
import useCreatePaymentCompleteCallback from '../hooks/use-create-payment-complete-callback';
import useCreatePaymentMethods from '../hooks/use-create-payment-methods';
import useDetectedCountryCode from '../hooks/use-detected-country-code';
import useGetThankYouUrl from '../hooks/use-get-thank-you-url';
import usePrepareProductsForCart from '../hooks/use-prepare-products-for-cart';
import useRecordCartLoaded from '../hooks/use-record-cart-loaded';
import useRecordCheckoutLoaded from '../hooks/use-record-checkout-loaded';
import useRemoveFromCartAndRedirect from '../hooks/use-remove-from-cart-and-redirect';
import useStoredCards from '../hooks/use-stored-cards';
import { useWpcomStore } from '../hooks/wpcom-store';
import { logStashLoadErrorEvent, logStashEvent } from '../lib/analytics';
import existingCardProcessor from '../lib/existing-card-processor';
import filterAppropriatePaymentMethods from '../lib/filter-appropriate-payment-methods';
import freePurchaseProcessor from '../lib/free-purchase-processor';
import genericRedirectProcessor from '../lib/generic-redirect-processor';
import getContactDetailsType from '../lib/get-contact-details-type';
import multiPartnerCardProcessor from '../lib/multi-partner-card-processor';
import payPalProcessor from '../lib/paypal-express-processor';
import { translateResponseCartToWPCOMCart } from '../lib/translate-cart';
import weChatProcessor from '../lib/we-chat-processor';
import webPayProcessor from '../lib/web-pay-processor';
import { StoredCard } from '../types/stored-cards';
import WPCheckout from './wp-checkout';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type { CheckoutPageErrorCallback } from '@automattic/composite-checkout';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { CountryListItem, CheckoutPaymentMethodSlug } from '@automattic/wpcom-checkout';

const { colors } = colorStudio;
const debug = debugFactory( 'calypso:composite-checkout:composite-checkout' );

const wpcomGetStoredCards = (): StoredCard[] => wp.req.get( { path: '/me/stored-cards' } );

export default function CheckoutMain( {
	siteSlug,
	siteId,
	productAliasFromUrl,
	productSourceFromUrl,
	overrideCountryList,
	redirectTo,
	feature,
	plan,
	purchaseId,
	couponCode: couponCodeFromUrl,
	isComingFromUpsell,
	isLoggedOutCart,
	isNoSiteCart,
	isGiftPurchase,
	infoMessage,
	isInModal,
	onAfterPaymentComplete,
	disabledThankYouPage,
	isJetpackCheckout = false,
	jetpackSiteSlug,
	jetpackPurchaseToken,
	isUserComingFromLoginForm,
	customizedPreviousPath,
	forceRadioButtons,
}: {
	siteSlug: string | undefined;
	siteId: number | undefined;
	productAliasFromUrl?: string | undefined;
	productSourceFromUrl?: string;
	overrideCountryList?: CountryListItem[];
	redirectTo?: string | undefined;
	feature?: string | undefined;
	plan?: string | undefined;
	purchaseId?: number | undefined;
	couponCode?: string | undefined;
	isComingFromUpsell?: boolean;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isGiftPurchase?: boolean;
	isInModal?: boolean;
	infoMessage?: JSX.Element;
	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	onAfterPaymentComplete?: () => void;
	disabledThankYouPage?: boolean;
	isJetpackCheckout?: boolean;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	isUserComingFromLoginForm?: boolean;
	customizedPreviousPath?: string;
	// TODO: This is just for unit tests. Remove forceRadioButtons everywhere
	// when calypso_checkout_variant_picker_radio_2212 ExPlat test completes.
	forceRadioButtons?: boolean;
} ) {
	const translate = useTranslate();
	const isJetpackNotAtomic =
		useSelector( ( state ) => {
			return siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
		} ) || isJetpackCheckout;
	const isPrivate = useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const createUserAndSiteBeforeTransaction =
		Boolean( isLoggedOutCart || isNoSiteCart ) && ! isJetpackCheckout;
	const reduxDispatch = useDispatch();
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

	const countriesList = useCountryList( overrideCountryList );

	const {
		productsForCart,
		isLoading: areCartProductsPreparing,
		error: cartProductPrepError,
	} = usePrepareProductsForCart( {
		productAliasFromUrl,
		purchaseId,
		isInModal,
		usesJetpackProducts: isJetpackNotAtomic,
		isPrivate,
		siteSlug: updatedSiteSlug,
		isLoggedOutCart,
		isNoSiteCart,
		isJetpackCheckout,
		jetpackSiteSlug,
		jetpackPurchaseToken,
		source: productSourceFromUrl,
		isGiftPurchase,
	} );

	const cartKey = useCartKey();
	const {
		applyCoupon,
		replaceProductInCart,
		replaceProductsInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
	} = useShoppingCart( cartKey );

	const updatedSiteId = isJetpackCheckout ? parseInt( String( responseCart.blog_id ), 10 ) : siteId;

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		productsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl,
		applyCoupon,
		addProductsToCart,
		replaceProductsInCart,
	} );

	useRecordCartLoaded( {
		responseCart,
		productsForCart,
		isInitialCartLoading,
	} );

	const { total, allowedPaymentMethods } = useMemo(
		() => translateResponseCartToWPCOMCart( responseCart ),
		[ responseCart ]
	);

	const domains = useSiteDomains( siteId );

	// IMPORTANT NOTE: This will be called BEFORE checkout completes because of
	// redirect payment methods like PayPal. They will redirect directly to the
	// post-checkout page decided by `getThankYouUrl` and therefore must be
	// passed the post-checkout URL before the transaction begins.
	const getThankYouUrlBase = useGetThankYouUrl( {
		siteSlug: updatedSiteSlug,
		redirectTo,
		purchaseId,
		feature,
		cart: responseCart,
		isJetpackNotAtomic,
		productAliasFromUrl,
		hideNudge: !! isComingFromUpsell,
		isInModal,
		isJetpackCheckout,
		domains,
	} );

	const getThankYouUrl = useCallback( () => {
		const url = getThankYouUrlBase();
		logStashEvent( 'thank you url generated', {
			url,
		} );
		return url;
	}, [ getThankYouUrlBase ] );

	const contactDetailsType = getContactDetailsType( responseCart );

	useWpcomStore();

	useDetectedCountryCode();

	// Record errors adding products to the cart
	useActOnceOnStrings( [ cartProductPrepError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) => {
			logStashEvent( 'calypso_composite_checkout_products_load_error', {
				error_message: String( message ),
			} );
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_products_load_error', {
					error_message: String( message ),
				} )
			);
		} );
	} );

	useActOnceOnStrings( [ cartLoadingError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) => {
			logStashEvent( 'calypso_checkout_composite_cart_error', {
				type: cartLoadingErrorType ?? '',
				message,
			} );
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_cart_error', {
					error_type: cartLoadingErrorType,
					error_message: String( message ),
				} )
			);
		} );
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

	const responseCartErrors = responseCart.messages?.errors ?? [];
	const areThereErrors =
		[ ...responseCartErrors, cartLoadingError, cartProductPrepError ].filter( isValueTruthy )
			.length > 0;

	const { isRemovingProductFromCart, removeProductFromCartAndMaybeRedirect } =
		useRemoveFromCartAndRedirect(
			updatedSiteSlug,
			createUserAndSiteBeforeTransaction,
			customizedPreviousPath
		);

	const {
		storedCards,
		isLoading: isLoadingStoredCards,
		error: storedCardsError,
	} = useStoredCards( wpcomGetStoredCards, Boolean( isLoggedOutCart ) );

	useActOnceOnStrings( [ storedCardsError ].filter( isValueTruthy ), ( messages ) => {
		messages.forEach( ( message ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_stored_card_error', {
					error_message: String( message ),
				} )
			);
		} );
	} );

	const paymentMethodObjects = useCreatePaymentMethods( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		storedCards,
		siteSlug: updatedSiteSlug,
	} );
	debug( 'created payment method objects', paymentMethodObjects );

	// Once we pass paymentMethods into CheckoutMain, we should try to avoid
	// changing them because it can cause awkward UX. Here we try to wait for
	// them to be all finished loading before we pass them along.
	const arePaymentMethodsLoading =
		responseCart.products.length < 1 ||
		isInitialCartLoading ||
		// Only wait for stored cards to load if we are using cards
		( allowedPaymentMethods.includes( 'card' ) && isLoadingStoredCards );

	const contactDetails = useSelect( ( select ) => select( 'wpcom-checkout' )?.getContactInfo() );
	const recaptchaClientId = useSelect( ( select ) =>
		select( 'wpcom-checkout' )?.getRecaptchaClientId()
	);

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				allowedPaymentMethods,
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

	const changePlanLength = useCallback(
		( uuidToReplace, newProductSlug, newProductId ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_plan_length_change', {
					new_product_slug: newProductSlug,
				} )
			);
			replaceProductInCart( uuidToReplace, {
				product_slug: newProductSlug,
				product_id: newProductId,
			} ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		},
		[ replaceProductInCart, reduxDispatch ]
	);

	const addItemAndLog: ( item: MinimalRequestCartProduct ) => void = useCallback(
		( cartItem ) => {
			try {
				recordAddEvent( cartItem );
			} catch ( error ) {
				logStashEvent( 'checkout_add_product_analytics_error', {
					error: String( error ),
				} );
			}
			addProductsToCart( [ cartItem ] ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		},
		[ addProductsToCart ]
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
			reduxDispatch,
			responseCart,
			siteId: updatedSiteId,
			siteSlug: updatedSiteSlug,
			stripeConfiguration,
			stripe,
			recaptchaClientId,
		} ),
		[
			contactDetails,
			createUserAndSiteBeforeTransaction,
			getThankYouUrl,
			includeDomainDetails,
			includeGSuiteDetails,
			reduxDispatch,
			responseCart,
			updatedSiteId,
			stripe,
			stripeConfiguration,
			updatedSiteSlug,
			recaptchaClientId,
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
			'existing-card': ( transactionData: unknown ) =>
				existingCardProcessor( transactionData, dataForProcessor ),
			'existing-card-ebanx': ( transactionData: unknown ) =>
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

	// This variable determines if we see the loading page or if checkout can
	// render its steps. Note that this does not prevent everything inside
	// `CheckoutProvider` from rendering, only everything inside
	// `CheckoutStepGroup`. This is because this variable is used to set the
	// `FormStatus` to `FormStatus::LOADING`. Be careful what you add to this
	// variable because it will slow down checkout's load time.
	const isCheckoutPageLoading: boolean =
		isInitialCartLoading ||
		arePaymentMethodsLoading ||
		paymentMethods.length < 1 ||
		responseCart.products.length < 1 ||
		countriesList.length < 1;
	if ( isCheckoutPageLoading ) {
		debug( 'still loading because one of these is true', {
			isInitialCartLoading,
			paymentMethods: paymentMethods.length < 1,
			arePaymentMethodsLoading: arePaymentMethodsLoading,
			items: responseCart.products.length < 1,
			countriesList: countriesList.length < 1,
		} );
	} else {
		debug( 'no longer loading' );
	}

	useRecordCheckoutLoaded( {
		isLoading: isCheckoutPageLoading,
		responseCart,
		storedCards,
		productAliasFromUrl,
		checkoutFlow,
		isGiftPurchase,
	} );

	const onPageLoadError: CheckoutPageErrorCallback = useCallback(
		( errorType, error, errorData ) => {
			logStashLoadErrorEvent( errorType, error, errorData );
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
					error_message: error.message + '; Stack: ' + error.stack,
					...errorData,
				} )
			);
		},
		[ reduxDispatch ]
	);

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	const onPaymentComplete = useCreatePaymentCompleteCallback( {
		createUserAndSiteBeforeTransaction,
		productAliasFromUrl,
		redirectTo,
		purchaseId,
		feature,
		isInModal,
		isComingFromUpsell,
		disabledThankYouPage,
		siteSlug: updatedSiteSlug,
		isJetpackCheckout,
		checkoutFlow,
	} );

	const handleStepChanged = useCallback(
		( {
			stepNumber,
			previousStepNumber,
			paymentMethodId,
		}: {
			stepNumber: number | null;
			previousStepNumber: number;
			paymentMethodId: string;
		} ) => {
			if ( stepNumber === 2 && previousStepNumber === 1 ) {
				reduxDispatch(
					recordTracksEvent( 'calypso_checkout_composite_first_step_complete', {
						payment_method:
							translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ) || '',
					} )
				);
			}
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_step_changed', {
					step: stepNumber,
				} )
			);
		},
		[ reduxDispatch ]
	);

	const handlePaymentMethodChanged = useCallback(
		( method: string ) => {
			logStashEvent( 'payment_method_select', {
				newMethodId: String( method ),
			} );
			// Need to convert to the slug format used in old checkout so events are comparable
			const rawPaymentMethodSlug = String( method );
			const legacyPaymentMethodSlug = translateCheckoutPaymentMethodToTracksPaymentMethod(
				rawPaymentMethodSlug as CheckoutPaymentMethodSlug
			);
			reduxDispatch( recordTracksEvent( 'calypso_checkout_switch_to_' + legacyPaymentMethodSlug ) );
		},
		[ reduxDispatch ]
	);

	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	const handlePaymentComplete = useCallback(
		( args ) => {
			onPaymentComplete?.( args );
			onAfterPaymentComplete?.();
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_step_complete', {
					step: 2,
					step_name: 'payment-method-step',
				} )
			);
		},
		[ onPaymentComplete, onAfterPaymentComplete, reduxDispatch ]
	);

	const handlePaymentError = useCallback(
		( {
			transactionError,
			paymentMethodId,
		}: {
			transactionError: string | null;
			paymentMethodId: string | null;
		} ) => {
			reduxDispatch(
				errorNotice( transactionError || translate( 'An error occurred during your purchase.' ) )
			);

			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_payment_error', {
					error_code: null,
					reason: String( transactionError ),
				} )
			);
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_payment_error', {
					error_code: null,
					payment_method:
						translateCheckoutPaymentMethodToWpcomPaymentMethod( paymentMethodId ?? '' ) || '',
					reason: String( transactionError ),
				} )
			);
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_stripe_transaction_error', {
					error_message: String( transactionError ),
				} )
			);
		},
		[ reduxDispatch, translate ]
	);

	const handlePaymentRedirect = useCallback( () => {
		reduxDispatch( infoNotice( translate( 'Redirecting to payment partner…' ) ) );
	}, [ reduxDispatch, translate ] );

	const cartHasSearchProduct = useMemo(
		() =>
			responseCart.products.some( ( { product_slug } ) =>
				JETPACK_SEARCH_PRODUCTS.includes( product_slug as typeof JETPACK_SEARCH_PRODUCTS[ number ] )
			),
		[ responseCart.products ]
	);

	return (
		<Fragment>
			<QueryJetpackSaleCoupon />
			<QuerySitePlans siteId={ updatedSiteId } />
			<QuerySitePurchases siteId={ updatedSiteId } />
			<QueryPlans />
			<QueryProducts />
			<QueryContactDetailsCache />
			{ cartHasSearchProduct && <QueryPostCounts siteId={ updatedSiteId || -1 } type="post" /> }
			<PageViewTracker
				path={ analyticsPath }
				title="Checkout"
				properties={ analyticsProps }
				options={ { useJetpackGoogleAnalytics: isJetpackCheckout || isJetpackNotAtomic } }
			/>
			<CheckoutProvider
				total={ total }
				onPaymentComplete={ handlePaymentComplete }
				onPaymentError={ handlePaymentError }
				onPaymentRedirect={ handlePaymentRedirect }
				onPageLoadError={ onPageLoadError }
				onStepChanged={ handleStepChanged }
				onPaymentMethodChanged={ handlePaymentMethodChanged }
				paymentMethods={ paymentMethods }
				paymentProcessors={ paymentProcessors }
				isLoading={ isCheckoutPageLoading }
				isValidating={ isCartPendingUpdate }
				theme={ theme }
				selectFirstAvailablePaymentMethod
			>
				<WPCheckout
					forceRadioButtons={ forceRadioButtons }
					customizedPreviousPath={ customizedPreviousPath }
					isRemovingProductFromCart={ isRemovingProductFromCart }
					areThereErrors={ areThereErrors }
					isInitialCartLoading={ isInitialCartLoading }
					addItemToCart={ addItemAndLog }
					changePlanLength={ changePlanLength }
					countriesList={ countriesList }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					infoMessage={ infoMessage }
					isLoggedOutCart={ !! isLoggedOutCart }
					onPageLoadError={ onPageLoadError }
					removeProductFromCart={ removeProductFromCartAndMaybeRedirect }
					showErrorMessageBriefly={ showErrorMessageBriefly }
					siteId={ updatedSiteId }
					siteUrl={ updatedSiteSlug }
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
