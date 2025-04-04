import { useRazorpay } from '@automattic/calypso-razorpay';
import { useStripe } from '@automattic/calypso-stripe';
import colorStudio from '@automattic/color-studio';
import { CheckoutProvider, checkoutTheme } from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import { isValueTruthy, getContactDetailsType } from '@automattic/wpcom-checkout';
import { useSelect } from '@wordpress/data';
import debugFactory from 'debug';
import DOMPurify from 'dompurify';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useMemo } from 'react';
import { useCheckoutMigrationIntroductoryOfferSticker } from 'calypso/data/site-migration/use-checkout-migration-introductory-offer-sticker';
import { recordAddEvent } from 'calypso/lib/analytics/cart';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useSiteDomains from 'calypso/my-sites/checkout/src/hooks/use-site-domains';
import {
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
	translateCheckoutPaymentMethodToTracksPaymentMethod,
} from 'calypso/my-sites/checkout/src/lib/translate-payment-method-names';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { useSelector, useDispatch } from 'calypso/state';
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
import { existingCardPrefix } from '../hooks/use-create-payment-methods/use-create-existing-cards';
import useDetectedCountryCode from '../hooks/use-detected-country-code';
import useGetThankYouUrl from '../hooks/use-get-thank-you-url';
import usePrepareProductsForCart from '../hooks/use-prepare-products-for-cart';
import useRecordCartLoaded from '../hooks/use-record-cart-loaded';
import useRecordCheckoutLoaded from '../hooks/use-record-checkout-loaded';
import useRemoveFromCartAndRedirect from '../hooks/use-remove-from-cart-and-redirect';
import { useStoredPaymentMethods } from '../hooks/use-stored-payment-methods';
import { logStashLoadErrorEvent, logStashEvent, convertErrorToString } from '../lib/analytics';
import existingCardProcessor from '../lib/existing-card-processor';
import filterAppropriatePaymentMethods from '../lib/filter-appropriate-payment-methods';
import freePurchaseProcessor from '../lib/free-purchase-processor';
import genericRedirectProcessor from '../lib/generic-redirect-processor';
import multiPartnerCardProcessor from '../lib/multi-partner-card-processor';
import payPalProcessor from '../lib/paypal-express-processor';
import { payPalJsProcessor } from '../lib/paypal-js-processor';
import { pixProcessor } from '../lib/pix-processor';
import razorpayProcessor from '../lib/razorpay-processor';
import { translateResponseCartToWPCOMCart } from '../lib/translate-cart';
import weChatProcessor from '../lib/we-chat-processor';
import webPayProcessor from '../lib/web-pay-processor';
import { CHECKOUT_STORE } from '../lib/wpcom-store';
import { CheckoutLoadingPlaceholder } from './checkout-loading-placeholder';
import CheckoutMainContent from './checkout-main-content';
import { OnChangeItemVariant } from './item-variation-picker';
import JetpackProRedirectModal from './jetpack-pro-redirect-modal';
import PrePurchaseNotices from './prepurchase-notices';
import type { PaymentProcessorOptions } from '../types/payment-processors';
import type {
	CheckoutPageErrorCallback,
	PaymentEventCallbackArguments,
	PaymentMethod,
} from '@automattic/composite-checkout';
import type { MinimalRequestCartProduct, ResponseCart } from '@automattic/shopping-cart';
import type { CheckoutPaymentMethodSlug, SitelessCheckoutType } from '@automattic/wpcom-checkout';

const { colors } = colorStudio;
const debug = debugFactory( 'calypso:checkout-main' );

export interface CheckoutMainProps {
	siteSlug: string | undefined;
	siteId: number | undefined;
	productAliasFromUrl?: string | undefined;
	productSourceFromUrl?: string;
	redirectTo?: string | undefined;
	feature?: string | undefined;
	plan?: string | undefined;
	purchaseId?: number | string | undefined;
	couponCode?: string | undefined;
	isComingFromUpsell?: boolean;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isGiftPurchase?: boolean;
	isInModal?: boolean;
	// IMPORTANT NOTE: This will not be called for redirect payment methods like
	// PayPal. They will redirect directly to the post-checkout page decided by
	// `getThankYouUrl`.
	onAfterPaymentComplete?: () => void;
	disabledThankYouPage?: boolean;
	sitelessCheckoutType?: SitelessCheckoutType;
	akismetSiteSlug?: string;
	marketplaceSiteSlug?: string;
	jetpackSiteSlug?: string;
	jetpackPurchaseToken?: string;
	isUserComingFromLoginForm?: boolean;
	customizedPreviousPath?: string;
	connectAfterCheckout?: boolean;
	/**
	 * `fromSiteSlug` is the Jetpack site slug passed from the site via url query arg (into
	 * checkout), for use cases when the site slug cannot be retrieved from state, ie- when there
	 * is not a site in context, such as in siteless checkout. As opposed to `siteSlug` which is
	 * the site slug present when the site is in context (ie- when site is connected and user is
	 * logged in).
	 */
	fromSiteSlug?: string;
	adminUrl?: string;
	hostingIntent?: string | undefined;
}

export default function CheckoutMain( {
	siteSlug,
	siteId,
	productAliasFromUrl,
	productSourceFromUrl,
	redirectTo,
	feature,
	plan,
	purchaseId,
	couponCode: couponCodeFromUrl,
	isComingFromUpsell,
	isLoggedOutCart,
	isNoSiteCart,
	isGiftPurchase,
	isInModal,
	onAfterPaymentComplete,
	disabledThankYouPage,
	sitelessCheckoutType,
	akismetSiteSlug,
	marketplaceSiteSlug,
	jetpackSiteSlug,
	jetpackPurchaseToken,
	isUserComingFromLoginForm,
	customizedPreviousPath,
	connectAfterCheckout,
	fromSiteSlug,
	adminUrl,
	hostingIntent,
}: CheckoutMainProps ) {
	const translate = useTranslate();

	const isJetpackNotAtomic =
		useSelector( ( state ) => {
			return siteId && isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId );
		} ) || sitelessCheckoutType === 'jetpack';
	const isPrivate = useSelector( ( state ) => siteId && isPrivateSite( state, siteId ) ) || false;
	const isSiteless =
		sitelessCheckoutType === 'jetpack' ||
		sitelessCheckoutType === 'akismet' ||
		sitelessCheckoutType === 'marketplace' ||
		sitelessCheckoutType === 'a4a';
	const { stripe, stripeConfiguration, isStripeLoading, stripeLoadingError } = useStripe();
	const { razorpayConfiguration, isRazorpayLoading, razorpayLoadingError } = useRazorpay();
	const createUserAndSiteBeforeTransaction =
		Boolean( isLoggedOutCart || isNoSiteCart ) && ! isSiteless;
	const reduxDispatch = useDispatch();

	const updatedSiteSlug = useMemo( () => {
		if ( sitelessCheckoutType === 'jetpack' ) {
			return jetpackSiteSlug;
		}

		// Currently, the `akismetSiteSlug` prop is not being passed to this component anywhere
		// We are not doing any site specific things with akismet checkout, so this should always be undefined for now
		// If this was not here to return `undefined`, the akismet routes would get messed with due to `siteSlug` returning "no-user" in akismet siteless checkout
		if ( sitelessCheckoutType === 'akismet' ) {
			return akismetSiteSlug;
		}

		if ( sitelessCheckoutType === 'marketplace' ) {
			return marketplaceSiteSlug;
		}

		return siteSlug;
	}, [ akismetSiteSlug, jetpackSiteSlug, marketplaceSiteSlug, sitelessCheckoutType, siteSlug ] );

	const showErrorMessageBriefly = useCallback(
		( error: string ) => {
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
		sitelessCheckoutType,
		isJetpackNotAtomic,
		isLoggedOutCart,
		isUserComingFromLoginForm,
	} );

	const countriesList = useCountryList();

	const {
		productsForCart,
		isLoading: areCartProductsPreparing,
		error: cartProductPrepError,
		addingRenewals,
	} = usePrepareProductsForCart( {
		productAliasFromUrl,
		purchaseId,
		isInModal,
		usesJetpackProducts: isJetpackNotAtomic,
		isPrivate,
		siteSlug: updatedSiteSlug,
		sitelessCheckoutType,
		isLoggedOutCart,
		isNoSiteCart,
		jetpackSiteSlug,
		jetpackPurchaseToken,
		source: productSourceFromUrl,
		isGiftPurchase,
		hostingIntent,
	} );

	const cartKey = useCartKey();
	const {
		applyCoupon,
		replaceProductInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
		reloadFromServer,
	} = useShoppingCart( cartKey );

	const { shouldSetMigrationSticker, isLoading: isStickerLoading } =
		useCheckoutMigrationIntroductoryOfferSticker( siteId, reloadFromServer );

	// For site-less checkouts, get the blog ID from the cart response
	const updatedSiteId = isSiteless ? parseInt( String( responseCart.blog_id ), 10 ) : siteId;

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		productsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl,
		applyCoupon,
		addProductsToCart,
		addingRenewals,
	} );

	useRecordCartLoaded( {
		responseCart,
		productsForCart,
		isInitialCartLoading,
	} );

	const { allowedPaymentMethods } = useMemo(
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
		sitelessCheckoutType,
		isInModal,
		domains,
		connectAfterCheckout,
		adminUrl,
		fromSiteSlug,
	} );

	const getThankYouUrl = useCallback( () => {
		const url = getThankYouUrlBase();
		logStashEvent( 'thank you url generated', { url }, 'info' );
		return url;
	}, [ getThankYouUrlBase ] );

	const contactDetailsType = getContactDetailsType( responseCart );

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
		paymentMethods: storedCards,
		isLoading: isLoadingStoredCards,
		error: storedCardsError,
	} = useStoredPaymentMethods( {
		isLoggedOut: isLoggedOutCart,
		type: 'card',
		isForBusiness: responseCart ? responseCart?.tax?.location?.is_for_business : null,
	} );

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
		contactDetailsType,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isRazorpayLoading,
		razorpayLoadingError,
		razorpayConfiguration,
		storedCards,
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

	const contactDetails = useSelect( ( select ) => select( CHECKOUT_STORE ).getContactInfo(), [] );
	const recaptchaClientId = useSelect(
		( select ) => select( CHECKOUT_STORE ).getRecaptchaClientId(),
		[]
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
		sitelessCheckoutType,
		checkoutFlow
	);

	const changeSelection = useCallback< OnChangeItemVariant >(
		( uuidToReplace, newProductSlug, newProductId, newProductVolume ) => {
			reduxDispatch(
				recordTracksEvent( 'calypso_checkout_composite_plan_length_change', {
					new_product_slug: newProductSlug,
				} )
			);

			replaceProductInCart( uuidToReplace, {
				product_slug: newProductSlug,
				product_id: newProductId,
				// Since volume is optional, only add it if it's defined
				...( newProductVolume && { volume: newProductVolume } ),
			} ).catch( () => {
				// Nothing needs to be done here. CartMessages will display the error to the user.
			} );
		},
		[ reduxDispatch, replaceProductInCart ]
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

	const isAkismetSitelessCheckout = responseCart.products.some(
		( product ) => product.extra.isAkismetSitelessCheckout
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
			razorpayConfiguration,
			recaptchaClientId,
			fromSiteSlug,
			isJetpackNotAtomic,
			isAkismetSitelessCheckout,
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
			razorpayConfiguration,
			updatedSiteSlug,
			recaptchaClientId,
			fromSiteSlug,
			isJetpackNotAtomic,
			isAkismetSitelessCheckout,
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
				multiPartnerCardProcessor( transactionData, dataForProcessor, {
					translate,
				} ),
			pix: ( transactionData: unknown ) =>
				pixProcessor( transactionData, dataForProcessor, translate ),
			alipay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'alipay', transactionData, dataForProcessor ),
			p24: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'p24', transactionData, dataForProcessor ),
			bancontact: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'bancontact', transactionData, dataForProcessor ),
			wechat: ( transactionData: unknown ) =>
				weChatProcessor( transactionData, dataForProcessor, translate ),
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
			'paypal-express': () => payPalProcessor( dataForProcessor ),
			'paypal-js': ( transactionData: unknown ) =>
				payPalJsProcessor( transactionData, dataForProcessor ),
			razorpay: ( transactionData: unknown ) =>
				razorpayProcessor( transactionData, dataForProcessor, translate ),
		} ),
		[ dataForProcessor, translate ]
	);

	const jetpackColors = isJetpackNotAtomic
		? {
				primary: colors[ 'Jetpack Green' ],
				primaryBorder: colors[ 'Jetpack Green 80' ],
				primaryOver: colors[ 'Jetpack Green 60' ],
				success: colors[ 'Jetpack Green' ],
				discount: colors[ 'Jetpack Green' ],
				highlight: colors[ 'WordPress Blue 50' ],
				highlightBorder: colors[ 'WordPress Blue 80' ],
				highlightOver: colors[ 'WordPress Blue 60' ],
		  }
		: {};
	const a4aColors =
		sitelessCheckoutType === 'a4a'
			? {
					primary: colors[ 'Automattic Blue' ],
					primaryBorder: colors[ 'Automattic Blue 80' ],
					primaryOver: colors[ 'Automattic Blue 60' ],
					highlight: colors[ 'Automattic Blue 50' ],
					highlightBorder: colors[ 'Automattic Blue 80' ],
					highlightOver: colors[ 'Automattic Blue 60' ],
			  }
			: {};
	const theme = {
		...checkoutTheme,
		colors: { ...checkoutTheme.colors, ...jetpackColors, ...a4aColors },
	};

	const isCheckoutV2ExperimentLoading = false;

	// This variable determines if we see the loading page or if checkout can
	// render its steps.
	//
	// Note that this does not prevent everything inside `CheckoutProvider` from
	// rendering, only everything inside `CheckoutStepGroup`. This is because
	// this variable is used to set the `FormStatus` to `FormStatus::LOADING`.
	//
	// These conditions do not need to be true if the cart is empty. The empty
	// cart page will show itself based on `shouldShowEmptyCartPage()` which has
	// its own set of conditions and is not affected by this list.
	//
	// Be careful what you add to this variable because it will slow down
	// checkout's apparent load time. If something can be loaded async inside
	// checkout, do that instead.
	const checkoutLoadingConditions: Array< { name: string; isLoading: boolean } > = [
		{ name: translate( 'Loading cart' ), isLoading: isInitialCartLoading },
		{ name: translate( 'Loading saved payment methods' ), isLoading: arePaymentMethodsLoading },
		{ name: translate( 'Initializing payment methods' ), isLoading: paymentMethods.length < 1 },
		{
			name: translate( 'Preparing products for cart' ),
			isLoading: responseCart.products.length < 1,
		},
		{ name: translate( 'Loading countries list' ), isLoading: countriesList.length < 1 },
		{ name: translate( 'Loading Site' ), isLoading: isCheckoutV2ExperimentLoading },
	];

	if ( shouldSetMigrationSticker ) {
		checkoutLoadingConditions.push( {
			name: translate( 'Setting introductory offer' ),
			isLoading: isStickerLoading,
		} );
	}

	const isCheckoutPageLoading: boolean = checkoutLoadingConditions.some(
		( condition ) => condition.isLoading
	);
	if ( isCheckoutPageLoading ) {
		debug( 'still loading because one of these is true', checkoutLoadingConditions );
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
					error_message: convertErrorToString( error ),
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
		sitelessCheckoutType,
		connectAfterCheckout,
		adminUrl,
		fromSiteSlug,
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
			logStashEvent( 'payment_method_select', { newMethodId: String( method ) }, 'info' );
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
		( args: PaymentEventCallbackArguments ) => {
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
			paymentMethodId: string | null | undefined;
		} ) => {
			const errorNoticeText = transactionError ? (
				<div dangerouslySetInnerHTML={ { __html: DOMPurify.sanitize( transactionError ) } } /> // eslint-disable-line react/no-danger -- The API response can contain anchor elements that we need to parse so they are rendered properly
			) : (
				translate( 'An error occurred during your purchase.' )
			);

			reduxDispatch( errorNotice( errorNoticeText ) );

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

	const initiallySelectedPaymentMethodId = getInitiallySelectedPaymentMethodId(
		responseCart,
		paymentMethods
	);

	return (
		<Fragment>
			<PageViewTracker
				path={ analyticsPath }
				title="Checkout"
				properties={ analyticsProps }
				options={ {
					useJetpackGoogleAnalytics: sitelessCheckoutType === 'jetpack' || isJetpackNotAtomic,
					useAkismetGoogleAnalytics: sitelessCheckoutType === 'akismet',
				} }
			/>
			<CheckoutProvider
				onPaymentComplete={ handlePaymentComplete }
				onPaymentError={ handlePaymentError }
				onPaymentRedirect={ handlePaymentRedirect }
				onPageLoadError={ onPageLoadError }
				onPaymentMethodChanged={ handlePaymentMethodChanged }
				paymentMethods={ paymentMethods }
				paymentProcessors={ paymentProcessors }
				isLoading={ isCheckoutPageLoading }
				isValidating={ isCartPendingUpdate }
				theme={ theme }
				selectFirstAvailablePaymentMethod
				initiallySelectedPaymentMethodId={ initiallySelectedPaymentMethodId }
			>
				<CheckoutMainContent
					loadingHeader={
						<CheckoutLoadingPlaceholder checkoutLoadingConditions={ checkoutLoadingConditions } />
					}
					onStepChanged={ handleStepChanged }
					customizedPreviousPath={ customizedPreviousPath }
					isRemovingProductFromCart={ isRemovingProductFromCart }
					areThereErrors={ areThereErrors }
					isInitialCartLoading={ isInitialCartLoading }
					addItemToCart={ addItemAndLog }
					changeSelection={ changeSelection }
					countriesList={ countriesList }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					infoMessage={ <PrePurchaseNotices siteId={ updatedSiteId } isSiteless={ isSiteless } /> }
					isLoggedOutCart={ !! isLoggedOutCart }
					onPageLoadError={ onPageLoadError }
					paymentMethods={ paymentMethods }
					removeProductFromCart={ removeProductFromCartAndMaybeRedirect }
					showErrorMessageBriefly={ showErrorMessageBriefly }
					siteId={ updatedSiteId }
					siteUrl={ updatedSiteSlug }
				/>
				{
					// Redirect modal is displayed mainly to all the agency partners who are purchasing Jetpack plans
					<JetpackProRedirectModal
						redirectTo={ redirectTo }
						productSourceFromUrl={ productSourceFromUrl }
					/>
				}
			</CheckoutProvider>
		</Fragment>
	);
}

function getAnalyticsPath(
	purchaseId: number | string | undefined,
	product: string | undefined,
	selectedSiteSlug: string | undefined,
	selectedFeature: string | undefined,
	plan: string | undefined,
	sitelessCheckoutType: SitelessCheckoutType,
	checkoutFlow: string
): { analyticsPath: string; analyticsProps: Record< string, string > } {
	debug( 'getAnalyticsPath', {
		purchaseId,
		product,
		selectedSiteSlug,
		selectedFeature,
		plan,
		sitelessCheckoutType,
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

	if ( sitelessCheckoutType === 'jetpack' ) {
		analyticsPath = analyticsPath.replace( 'checkout', 'checkout/jetpack' );
	}

	if ( sitelessCheckoutType === 'akismet' ) {
		analyticsPath = analyticsPath.replace( 'checkout', 'checkout/akismet' );
	}

	return { analyticsPath, analyticsProps };
}

function getInitiallySelectedPaymentMethodId(
	responseCart: ResponseCart,
	paymentMethods: PaymentMethod[]
): string | undefined {
	const firstRenewalWithPaymentMethod = responseCart.products.find( ( product ) =>
		Boolean( product.stored_details_id )
	);
	if ( ! firstRenewalWithPaymentMethod ) {
		return undefined;
	}
	const matchingCheckoutPaymentMethod = paymentMethods.find(
		( method ) =>
			method.id === `${ existingCardPrefix }${ firstRenewalWithPaymentMethod.stored_details_id }`
	);
	if ( matchingCheckoutPaymentMethod ) {
		return matchingCheckoutPaymentMethod.id;
	}
	return undefined;
}
