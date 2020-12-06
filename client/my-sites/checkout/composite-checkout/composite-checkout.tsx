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
import { useShoppingCart, ResponseCart } from '@automattic/shopping-cart';
import colorStudio from '@automattic/color-studio';
import { useStripe } from '@automattic/calypso-stripe';

/**
 * Internal dependencies
 */
import wp from 'calypso/lib/wp';
import notices from 'calypso/notices';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import { updateContactDetailsCache } from 'calypso/state/domains/management/actions';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import { StateSelect } from 'calypso/my-sites/domains/components/form';
import { getPlan } from 'calypso/lib/plans';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import QueryContactDetailsCache from 'calypso/components/data/query-contact-details-cache';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QueryPlans from 'calypso/components/data/query-plans';
import QueryProducts from 'calypso/components/data/query-products-list';
import QueryExperiments from 'calypso/components/data/query-experiments';
import CartMessages from 'calypso/my-sites/checkout/cart/cart-messages';
import useIsApplePayAvailable from './hooks/use-is-apple-pay-available';
import filterAppropriatePaymentMethods from './lib/filter-appropriate-payment-methods';
import useStoredCards from './hooks/use-stored-cards';
import usePrepareProductsForCart from './hooks/use-prepare-products-for-cart';
import useCreatePaymentMethods from './use-create-payment-methods';
import {
	applePayProcessor,
	freePurchaseProcessor,
	multiPartnerCardProcessor,
	fullCreditsProcessor,
	payPalProcessor,
	genericRedirectProcessor,
	weChatProcessor,
} from './payment-method-processors';
import existingCardProcessor from './lib/existing-card-processor';
import useGetThankYouUrl from './hooks/use-get-thank-you-url';
import createAnalyticsEventHandler from './record-analytics';
import { useProductVariants } from './hooks/product-variants';
import { translateResponseCartToWPCOMCart } from './lib/translate-cart';
import useCountryList from './hooks/use-country-list';
import useCachedDomainContactDetails from './hooks/use-cached-domain-contact-details';
import useActOnceOnStrings from './hooks/use-act-once-on-strings';
import useRedirectIfCartEmpty from './hooks/use-redirect-if-cart-empty';
import useRecordCheckoutLoaded from './hooks/use-record-checkout-loaded';
import useRecordCartLoaded from './hooks/use-record-cart-loaded';
import useAddProductsFromUrl from './hooks/use-add-products-from-url';
import useDetectedCountryCode from './hooks/use-detected-country-code';
import WPCheckout from './components/wp-checkout';
import { useWpcomStore } from './hooks/wpcom-store';
import { areDomainsInLineItems } from './hooks/has-domains';
import {
	emptyManagedContactDetails,
	applyContactDetailsRequiredMask,
	domainRequiredContactDetails,
	taxRequiredContactDetails,
	ManagedContactDetails,
} from './types/wpcom-store-state';
import { StoredCard } from './types/stored-cards';
import { CountryListItem } from './types/country-list-item';
import { WPCOMCartItem } from './types/checkout-cart';
import doesValueExist from './lib/does-value-exist';
import EmptyCart from './components/empty-cart';
import getContactDetailsType from './lib/get-contact-details-type';
import getDomainDetails from './lib/get-domain-details';
import getPostalCode from './lib/get-postal-code';
import mergeIfObjects from './lib/merge-if-objects';
import type { ReactStandardAction } from './types/analytics';
import useCreatePaymentCompleteCallback from './hooks/use-create-payment-complete-callback';

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
			notices.error( message || translate( 'An error occurred during your purchase.' ) );
		},
		[ translate ]
	);

	const showErrorMessageBriefly = useCallback(
		( error ) => {
			debug( 'error', error );
			const message = error && error.toString ? error.toString() : error;
			notices.error( message || translate( 'An error occurred during your purchase.' ), {
				duration: 5000,
			} );
		},
		[ translate ]
	);

	const showInfoMessage = useCallback( ( message ) => {
		debug( 'info', message );
		notices.info( message );
	}, [] );

	const showSuccessMessage = useCallback( ( message ) => {
		debug( 'success', message );
		notices.success( message );
	}, [] );

	const countriesList = useCountryList( overrideCountryList || [] );

	const {
		productsForCart,
		isLoading: areCartProductsPreparing,
		error: cartProductPrepError,
	} = usePrepareProductsForCart( {
		productAliasFromUrl,
		purchaseId,
		isJetpackNotAtomic,
		isPrivate,
	} );

	const {
		removeProductFromCart,
		couponStatus,
		applyCoupon,
		removeCoupon,
		updateLocation,
		replaceProductInCart,
		isLoading: isLoadingCart,
		isPendingUpdate: isCartPendingUpdate,
		responseCart,
		loadingError: cartLoadingError,
		loadingErrorType: cartLoadingErrorType,
		addProductsToCart,
	} = useShoppingCart();

	const isInitialCartLoading = useAddProductsFromUrl( {
		isLoadingCart,
		isCartPendingUpdate,
		productsForCart,
		areCartProductsPreparing,
		couponCodeFromUrl,
		applyCoupon,
		addProductsToCart,
	} );

	useRecordCartLoaded( {
		recordEvent,
		responseCart,
		productsForCart,
		isInitialCartLoading,
	} );

	const {
		items,
		tax,
		coupon: couponItem,
		total,
		credits,
		subtotal,
		allowedPaymentMethods,
	} = useMemo( () => translateResponseCartToWPCOMCart( responseCart ), [ responseCart ] );

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

	useWpcomStore(
		registerStore,
		applyContactDetailsRequiredMask(
			emptyManagedContactDetails,
			areDomainsInLineItems( items ) ? domainRequiredContactDetails : taxRequiredContactDetails
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
	// because notices.error() otherwise will remove the previously displayed
	// errors.
	const errorsToDisplay = [
		cartLoadingError,
		stripeLoadingError?.message,
		cartProductPrepError,
	].filter( doesValueExist );
	useActOnceOnStrings( errorsToDisplay, () => {
		notices.error( errorsToDisplay.map( ( message ) => <p key={ message }>{ message }</p> ) );
	} );

	const isFullCredits =
		credits?.amount && credits.amount.value > 0 && credits.amount.value >= subtotal.amount.value;
	const itemsForCheckout = ( items.length
		? [ ...items, tax, couponItem, ...( isFullCredits ? [] : [ credits ] ) ]
		: []
	).filter( doesValueExist );
	debug( 'items for checkout', itemsForCheckout );

	let cartEmptyRedirectUrl = `/plans/${ siteSlug || '' }`;

	if ( createUserAndSiteBeforeTransaction ) {
		const siteSlugLoggedOutCart = select( 'wpcom' )?.getSiteSlug();
		cartEmptyRedirectUrl = siteSlugLoggedOutCart ? `/plans/${ siteSlugLoggedOutCart }` : '/start';
	}

	const errors = responseCart.messages?.errors ?? [];
	const areThereErrors =
		[ ...errors, cartLoadingError, cartProductPrepError ].filter( doesValueExist ).length > 0;
	const doNotRedirect = isInitialCartLoading || isCartPendingUpdate || areThereErrors;
	const areWeRedirecting = useRedirectIfCartEmpty(
		doNotRedirect,
		items,
		cartEmptyRedirectUrl,
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
	} = useIsApplePayAvailable( stripe, stripeConfiguration, !! stripeLoadingError, items );

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
		items.length < 1 ||
		isInitialCartLoading ||
		// Only wait for stored cards to load if we are using cards
		( allowedPaymentMethods.includes( 'card' ) && isLoadingStoredCards ) ||
		// Only wait for apple pay to load if we are using apple pay
		( allowedPaymentMethods.includes( 'apple-pay' ) && isApplePayLoading );

	const contactInfo: ManagedContactDetails | undefined = select( 'wpcom' )?.getContactInfo();
	const countryCode: string = contactInfo?.countryCode?.value ?? '';
	const subdivisionCode: string = contactInfo?.state?.value ?? '';

	const paymentMethods = arePaymentMethodsLoading
		? []
		: filterAppropriatePaymentMethods( {
				paymentMethodObjects,
				countryCode,
				total,
				credits,
				subtotal,
				allowedPaymentMethods,
				responseCart,
		  } );
	debug( 'filtered payment method objects', paymentMethods );

	const getItemVariants = useProductVariants( {
		siteId,
		productSlug: getPlanProductSlugs( items )[ 0 ],
	} );

	const { analyticsPath, analyticsProps } = getAnalyticsPath(
		String( purchaseId ),
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

	const contactDetailsType = getContactDetailsType( responseCart );
	const includeDomainDetails = contactDetailsType === 'domain';
	const includeGSuiteDetails = contactDetailsType === 'gsuite';
	const transactionOptions = { createUserAndSiteBeforeTransaction };
	const dataForProcessor = useMemo(
		() => ( {
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
			createUserAndSiteBeforeTransaction,
			stripeConfiguration,
		} ),
		[
			includeDomainDetails,
			includeGSuiteDetails,
			recordEvent,
			createUserAndSiteBeforeTransaction,
			stripeConfiguration,
		]
	);
	const dataForRedirectProcessor = useMemo(
		() => ( {
			...dataForProcessor,
			getThankYouUrl,
			siteSlug,
		} ),
		[ dataForProcessor, getThankYouUrl, siteSlug ]
	);

	const domainDetails = useMemo(
		() =>
			getDomainDetails( {
				includeDomainDetails,
				includeGSuiteDetails,
			} ),
		[ includeGSuiteDetails, includeDomainDetails ]
	);
	const postalCode = getPostalCode();

	const paymentProcessors = useMemo(
		() => ( {
			'apple-pay': ( transactionData: unknown ) =>
				applePayProcessor( transactionData, dataForProcessor, transactionOptions ),
			'free-purchase': ( transactionData: unknown ) =>
				freePurchaseProcessor( transactionData, dataForProcessor ),
			card: ( transactionData: unknown ) =>
				multiPartnerCardProcessor( transactionData, dataForProcessor, transactionOptions ),
			alipay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'alipay', transactionData, dataForRedirectProcessor ),
			p24: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'p24', transactionData, dataForRedirectProcessor ),
			bancontact: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'bancontact', transactionData, dataForRedirectProcessor ),
			giropay: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'giropay', transactionData, dataForRedirectProcessor ),
			wechat: ( transactionData: unknown ) =>
				weChatProcessor( transactionData, dataForRedirectProcessor ),
			netbanking: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'netbanking', transactionData, dataForRedirectProcessor ),
			id_wallet: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'id_wallet', transactionData, dataForRedirectProcessor ),
			ideal: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'ideal', transactionData, dataForRedirectProcessor ),
			sofort: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'sofort', transactionData, dataForRedirectProcessor ),
			eps: ( transactionData: unknown ) =>
				genericRedirectProcessor( 'eps', transactionData, dataForRedirectProcessor ),
			'ebanx-tef': ( transactionData: unknown ) =>
				genericRedirectProcessor( 'brazil-tef', transactionData, dataForRedirectProcessor ),
			'full-credits': ( transactionData: unknown ) =>
				fullCreditsProcessor( transactionData, dataForProcessor, transactionOptions ),
			'existing-card': ( transactionData: unknown ) =>
				existingCardProcessor(
					mergeIfObjects( transactionData, {
						country: countryCode,
						postalCode,
						subdivisionCode,
						siteId: siteId ? String( siteId ) : '',
						domainDetails,
					} ),
					dataForProcessor
				),
			paypal: ( transactionData: unknown ) =>
				payPalProcessor(
					transactionData,
					{ ...dataForProcessor, getThankYouUrl, couponItem },
					transactionOptions
				),
		} ),
		[
			siteId,
			couponItem,
			dataForProcessor,
			dataForRedirectProcessor,
			getThankYouUrl,
			transactionOptions,
			countryCode,
			subdivisionCode,
			postalCode,
			domainDetails,
		]
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
		items.length < 1;
	if ( isLoading ) {
		debug( 'still loading because one of these is true', {
			isInitialCartLoading,
			paymentMethods: paymentMethods.length < 1,
			arePaymentMethodsLoading: arePaymentMethodsLoading,
			items: items.length < 1,
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
	} );

	if (
		shouldShowEmptyCartPage( {
			responseCart,
			areWeRedirecting,
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
				<CartMessages
					cart={ responseCart }
					selectedSite={ { slug: siteSlug } }
					isLoadingCart={ isInitialCartLoading }
				/>
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
			<QueryExperiments />
			<QueryProducts />
			<QueryContactDetailsCache />
			<PageViewTracker path={ analyticsPath } title="Checkout" properties={ analyticsProps } />
			<CartMessages
				cart={ responseCart }
				selectedSite={ { slug: siteSlug } }
				isLoadingCart={ isInitialCartLoading }
			/>
			<CheckoutProvider
				items={ itemsForCheckout }
				total={ total }
				onPaymentComplete={ onPaymentComplete }
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
					removeProductFromCart={ removeProductFromCart }
					updateLocation={ updateLocation }
					applyCoupon={ applyCoupon }
					removeCoupon={ removeCoupon }
					couponStatus={ couponStatus }
					changePlanLength={ changePlanLength }
					siteId={ siteId }
					siteUrl={ siteSlug }
					countriesList={ countriesList }
					StateSelect={ StateSelect }
					getItemVariants={ getItemVariants }
					responseCart={ responseCart }
					addItemToCart={ addItemWithEssentialProperties }
					subtotal={ subtotal }
					credits={ credits }
					isCartPendingUpdate={ isCartPendingUpdate }
					showErrorMessageBriefly={ showErrorMessageBriefly }
					isLoggedOutCart={ isLoggedOutCart }
					createUserAndSiteBeforeTransaction={ createUserAndSiteBeforeTransaction }
					infoMessage={ infoMessage }
				/>
			</CheckoutProvider>
		</React.Fragment>
	);
}

function getPlanProductSlugs( items: WPCOMCartItem[] ): string[] {
	return items
		.filter( ( item ) => {
			return item.type !== 'tax' && getPlan( item.wpcom_meta.product_slug );
		} )
		.map( ( item ) => item.wpcom_meta.product_slug );
}

function getAnalyticsPath(
	purchaseId: string | undefined,
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
