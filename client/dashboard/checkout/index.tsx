import {
	geoLocationQuery,
	cachedDomainContactInfoQuery,
	submitTransactionMutation,
	confirmPayPalPPCPPaymentMutation,
	createStripeSetupIntentMutation,
	saveCreditCardMutation,
} from '@automattic/api-queries';
import { useStripe } from '@automattic/calypso-stripe';
import {
	CheckoutProvider,
	CheckoutStepGroup,
	CheckoutStep,
	PaymentMethodStep,
	CheckoutFormSubmit,
	checkoutTheme,
	useIsStepActive,
	useCompleteAllSteps,
} from '@automattic/composite-checkout';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import {
	Button,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardBody, CardDivider } from '../components/card';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { defaultTaxLocation } from '../components/tax-location-form';
import { CheckoutTerms } from './components/checkout-terms';
import { CouponField } from './components/coupon-field';
import { ItemVariationPicker } from './components/item-variation-picker';
import { OrderSummary } from './components/order-summary';
import {
	DomainContactDetailsStepTitle,
	DomainContactDetailsStepContent,
	DomainContactDetailsSummary,
	useDomainContactDetailsState,
	validateDomainContactDetails,
	cartHasDomainProduct,
	getDomainNamesFromCart,
	getCartLocationFromContactDetails,
} from './domain-contact-details-step';
import { useCreatePaymentMethods } from './payment-methods';
import {
	existingCardProcessor,
	existingPayPalPPCPProcessor,
	freePurchaseProcessor,
	stripeCardProcessor,
	payPalPPCPProcessor,
	webPayProcessor,
	type ExistingCardProcessorSubmitData,
	type ExistingPayPalPPCPSubmitData,
	type PayPalPPCPSubmitData,
	type StripeCardProcessorSubmitData,
	type WebPayProcessorSubmitData,
} from './processors';
import {
	TaxInformationStepTitle,
	TaxInformationStepContent,
	TaxInformationSummary,
	useTaxLocationState,
	validateAndUpdateCartLocation,
} from './tax-information-step';
import { useAddProductsFromUrl } from './use-add-products-from-url';
import type { CheckoutSearchParams } from '../app/router/checkout';
import type {
	TaxValidationResponse,
	TransactionResponse,
	StoredPaymentMethodTaxLocation,
	DomainContactValidationResponse,
} from '@automattic/api-core';
import type {
	CouponStatus,
	ResponseCart,
	ResponseCartProduct,
	ReplaceProductInCart,
} from '@automattic/shopping-cart';

import './style.scss';

/**
 * Returns a human-readable billing period label for a cart product, or null if the billing period
 * is not meaningful to display (one-time purchases or unrecognized periods).
 *
 * Multi-year domain registrations are billed annually after the initial term
 * (e.g. a two-year purchase is "Billed 2 years, then annually").
 */
function getBillingPeriodLabel( product: ResponseCartProduct ): string | null {
	// Multi-year domain registrations pre-purchase multiple annual renewals.
	// The billing period stays annual, but we need to convey the initial term length.
	if ( product.is_domain_registration && product.volume > 1 ) {
		// translators: %d is the number of years (e.g. "Billed 2 years, then annually")
		return __( 'Billed %d years, then annually' ).replace( '%d', String( product.volume ) );
	}

	const days = parseInt( product.bill_period, 10 );
	if ( days === 31 ) {
		return __( 'Billed monthly' );
	}
	if ( days === 365 ) {
		return __( 'Billed annually' );
	}
	if ( days === 730 ) {
		return __( 'Billed every two years' );
	}
	if ( days === 1095 ) {
		return __( 'Billed every three years' );
	}

	return null;
}

/**
 * Order Review Step - shows cart items and total
 */
function OrderReviewStepContent( {
	responseCart,
	removeProductFromCart,
	replaceProductInCart,
	applyCoupon,
	removeCoupon,
	couponStatus,
}: {
	responseCart: ResponseCart;
	removeProductFromCart: ( uuid: string ) => void;
	replaceProductInCart: ReplaceProductInCart;
	applyCoupon: ( couponCode: string ) => Promise< unknown >;
	removeCoupon: () => Promise< unknown >;
	couponStatus: CouponStatus;
} ) {
	return (
		<Card>
			<CardBody>
				{ responseCart?.products && responseCart.products.length > 0 ? (
					<VStack spacing={ 3 }>
						{ responseCart.products.map( ( product, index ) => {
							const isRenewal = product.is_renewal || product.extra?.purchaseType === 'renewal';
							const billingPeriodLabel = getBillingPeriodLabel( product );
							const subtitleParts = [
								isRenewal ? __( 'Renewal' ) : null,
								billingPeriodLabel,
							].filter( Boolean );
							const subtitle = subtitleParts.join( ' · ' );
							return (
								<VStack key={ product.uuid } spacing={ 0 }>
									{ index > 0 && <CardDivider /> }
									<HStack justify="space-between" alignment="flex-start" spacing={ 4 }>
										<VStack spacing={ 0 }>
											<Text weight={ 600 }>{ product.product_name }</Text>
											{ product.meta && (
												<Text style={ { fontSize: '0.875rem', color: '#646970' } }>
													{ product.meta }
												</Text>
											) }
											{ subtitle && (
												<Text style={ { fontSize: '0.875rem', color: '#646970' } }>
													{ subtitle }
												</Text>
											) }
											<Button
												variant="link"
												isDestructive
												size="compact"
												onClick={ () => removeProductFromCart( product.uuid ) }
												style={ { marginBlockStart: '4px' } }
											>
												{ __( 'Remove' ) }
											</Button>
										</VStack>
										<Text style={ { flexShrink: 0 } }>
											{ formatCurrency( product.item_subtotal_integer, product.currency, {
												isSmallestUnit: true,
												stripZeros: true,
											} ) }
										</Text>
									</HStack>
									<ItemVariationPicker
										product={ product }
										replaceProductInCart={ replaceProductInCart }
									/>
								</VStack>
							);
						} ) }
						<CardDivider />
						<CouponField
							applyCoupon={ applyCoupon }
							removeCoupon={ removeCoupon }
							couponStatus={ couponStatus }
							appliedCoupon={ responseCart.coupon }
						/>
						<CardDivider />
						{ responseCart.total_tax_integer > 0 && (
							<HStack justify="space-between" alignment="center">
								<Text>{ __( 'Subtotal' ) }</Text>
								<Text>
									{ formatCurrency( responseCart.sub_total_integer, responseCart.currency, {
										isSmallestUnit: true,
										stripZeros: true,
									} ) }
								</Text>
							</HStack>
						) }
						{ responseCart.total_tax_integer > 0 && (
							<HStack justify="space-between" alignment="center">
								<Text>{ __( 'Tax' ) }</Text>
								<Text>
									{ formatCurrency( responseCart.total_tax_integer, responseCart.currency, {
										isSmallestUnit: true,
										stripZeros: true,
									} ) }
								</Text>
							</HStack>
						) }
						{ responseCart.credits_integer > 0 && (
							<HStack justify="space-between" alignment="center">
								<Text>{ __( 'Credits' ) }</Text>
								<Text>
									{ formatCurrency( -responseCart.credits_integer, responseCart.currency, {
										isSmallestUnit: true,
										stripZeros: true,
									} ) }
								</Text>
							</HStack>
						) }
						<HStack
							justify="space-between"
							alignment="center"
							style={ { fontSize: '1.125rem', fontWeight: 600 } }
						>
							<Text weight={ 600 }>{ __( 'Total' ) }</Text>
							<Text weight={ 600 }>
								{ formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
									isSmallestUnit: true,
									stripZeros: true,
								} ) }
							</Text>
						</HStack>
					</VStack>
				) : (
					<Text>{ __( 'Your cart is empty.' ) }</Text>
				) }
			</CardBody>
		</Card>
	);
}

/**
 * Order Review Step Title - changes based on active state
 */
function OrderReviewStepTitle() {
	const isActive = useIsStepActive();
	return <>{ isActive ? __( 'Review your order' ) : __( 'Order' ) }</>;
}

/**
 * Order Review Summary - shown when step is complete
 */
function OrderReviewSummary( { responseCart }: { responseCart: ResponseCart } ) {
	const itemCount = responseCart?.products?.length ?? 0;
	const itemCountLabel =
		itemCount === 1
			? __( '1 item' )
			: // translators: %d is the number of items in the cart
			  __( '%d items' ).replace( '%d', String( itemCount ) );
	const total = formatCurrency( responseCart.total_cost_integer, responseCart.currency, {
		isSmallestUnit: true,
		stripZeros: true,
	} );
	return (
		<Text>
			{ itemCountLabel } · { total }
		</Text>
	);
}

/**
 * Attempts to auto-complete all checkout steps once prefilled data is ready.
 * Must be rendered inside CheckoutStepGroup to access its context.
 *
 * When a user has saved billing/contact data, we run each step's completion
 * callback so they land directly on the payment step rather than having to
 * manually advance through forms they've already filled out.
 *
 * `onBeforeAttempt` and `onAfterAttempt` let the parent suppress validation
 * error notices during the attempt — the user hasn't interacted yet, so
 * silent failure is the right behaviour.
 */
function AutoCompleteSteps( {
	isReady,
	onBeforeAttempt,
	onAfterAttempt,
}: {
	isReady: boolean;
	onBeforeAttempt: () => void;
	onAfterAttempt: () => void;
} ) {
	const completeAllSteps = useCompleteAllSteps();
	const hasAttempted = useRef( false );

	useEffect( () => {
		if ( ! isReady || hasAttempted.current ) {
			return;
		}
		hasAttempted.current = true;
		onBeforeAttempt();
		void completeAllSteps().finally( onAfterAttempt );
	}, [ isReady, completeAllSteps, onBeforeAttempt, onAfterAttempt ] );

	return null;
}

/**
 * Inner checkout component that uses the shopping cart
 * Must be wrapped in ShoppingCartProvider
 */
export default function CheckoutPageContent( {
	site,
	productSlug,
	productMeta,
	productQuantity,
	subscriptionId,
	coupon,
}: { site: { ID: number; slug: string } } & CheckoutSearchParams ) {
	// Get cart for this site (pass site ID as cart key)
	const {
		responseCart,
		isLoading: isLoadingCart,
		loadingError: cartLoadingError,
		updateLocation,
		removeProductFromCart,
		replaceProductInCart,
		applyCoupon,
		removeCoupon,
		couponStatus,
	} = useShoppingCart( site.ID );

	// Add products from URL query params to the cart when checkout loads.
	const isAddingProductsFromUrl = useAddProductsFromUrl( {
		siteId: site.ID,
		productSlug,
		productMeta,
		productQuantity,
		subscriptionId,
		coupon,
	} );

	// Calculate cart total and currency
	const cartTotal = responseCart?.total_cost_integer ?? 0;
	const currency = responseCart?.currency;

	// Get Stripe configuration
	const { stripe, stripeConfiguration } = useStripe();

	// Get geolocation for default country
	const { data: geoData } = useQuery( geoLocationQuery() );

	// Initialize tax location from cart or geolocation
	const initialTaxLocation = useMemo( (): StoredPaymentMethodTaxLocation => {
		const cartLocation = responseCart?.tax?.location;

		// If cart has a location, use it
		if ( cartLocation && cartLocation.country_code ) {
			return {
				country_code: cartLocation.country_code || '',
				postal_code: cartLocation.postal_code || '',
				subdivision_code: cartLocation.subdivision_code || '',
				ip_address: '',
				vat_id: cartLocation.vat_id || '',
				organization: cartLocation.organization || '',
				address: cartLocation.address || '',
				city: cartLocation.city || '',
			};
		}

		// Otherwise, use geolocation for country only
		if ( geoData?.country_short ) {
			return {
				...defaultTaxLocation,
				country_code: geoData.country_short,
			};
		}

		// Fallback to empty location
		return defaultTaxLocation;
	}, [ responseCart?.tax?.location, geoData?.country_short ] );

	// Tax location state
	const { taxLocation, handleTaxLocationChange, setTaxLocation } =
		useTaxLocationState( initialTaxLocation );

	// Tracks whether we have enough prefilled data to attempt auto-completing steps.
	const [ isReadyToAutoComplete, setIsReadyToAutoComplete ] = useState( false );

	// Domain contact details state — only used when cart has domain products
	const { contactDetails, setContactDetails, handleContactDetailsChange } =
		useDomainContactDetailsState();
	const hasDomainProducts = !! responseCart && cartHasDomainProduct( responseCart );

	// Fetch cached domain contact info for pre-filling (only when cart has domains)
	const { data: cachedContactInfo } = useQuery( {
		...cachedDomainContactInfoQuery(),
		enabled: hasDomainProducts,
	} );

	// Track if we've already loaded from cache to avoid overwriting user changes
	const hasLoadedContactFromCache = useRef( false );

	// Pre-fill domain contact details from cached info once it loads
	useEffect( () => {
		if ( cachedContactInfo && ! hasLoadedContactFromCache.current ) {
			hasLoadedContactFromCache.current = true;
			setContactDetails( {
				firstName: cachedContactInfo.first_name || '',
				lastName: cachedContactInfo.last_name || '',
				organization: cachedContactInfo.organization || '',
				email: cachedContactInfo.email || '',
				phone: cachedContactInfo.phone || '',
				address1: cachedContactInfo.address_1 || '',
				address2: cachedContactInfo.address_2 || '',
				city: cachedContactInfo.city || '',
				state: cachedContactInfo.state || '',
				postalCode: cachedContactInfo.postal_code || '',
				countryCode: cachedContactInfo.country_code || '',
				fax: cachedContactInfo.fax || '',
				vatId: cachedContactInfo.vat_id || '',
			} );
			// If cached data already has a country code, we have enough info to attempt
			// auto-completing the domain contact step (which also serves as billing).
			if ( cachedContactInfo.country_code ) {
				setIsReadyToAutoComplete( true );
			}
		}
	}, [ cachedContactInfo, setContactDetails ] );

	// Track if we've already loaded from cart to avoid overwriting user changes
	const hasLoadedFromCart = useRef( false );

	// Update tax location when cart data loads
	useEffect( () => {
		const cartLocation = responseCart?.tax?.location;

		// Only update if:
		// 1. Cart has location data
		// 2. We haven't already loaded from cart
		// 3. Cart is not loading
		if (
			cartLocation &&
			cartLocation.country_code &&
			! hasLoadedFromCart.current &&
			! isLoadingCart
		) {
			hasLoadedFromCart.current = true;
			setTaxLocation( {
				country_code: cartLocation.country_code || '',
				postal_code: cartLocation.postal_code || '',
				subdivision_code: cartLocation.subdivision_code || '',
				ip_address: '',
				vat_id: cartLocation.vat_id || '',
				organization: cartLocation.organization || '',
				address: cartLocation.address || '',
				city: cartLocation.city || '',
			} );
			// If the cart already has a saved location, we have enough info to attempt
			// auto-completing the billing address step. Skip this when we have domain
			// products because those use the domain contact step instead.
			if ( ! hasDomainProducts ) {
				setIsReadyToAutoComplete( true );
			}
		}
	}, [ responseCart?.tax?.location, isLoadingCart, setTaxLocation, hasDomainProducts ] );

	// For displaying validation errors and transaction messages
	const { createErrorNotice, createSuccessNotice, removeNotice } = useDispatch( noticesStore );

	// While auto-completing steps on load, validation errors should be suppressed —
	// the user hasn't touched the form yet, so surfacing errors would be confusing.
	const isAutoCompleting = useRef( false );
	const handleAutoCompleteStart = useCallback( () => {
		isAutoCompleting.current = true;
	}, [] );
	const handleAutoCompleteEnd = useCallback( () => {
		isAutoCompleting.current = false;
	}, [] );

	// Handler for tax validation errors
	const handleValidationError = useCallback(
		( validationResponse: TaxValidationResponse ) => {
			if ( isAutoCompleting.current ) {
				return;
			}
			removeNotice( 'tax-validation-error' );

			// Display simple error messages if available
			if ( validationResponse.messages_simple && validationResponse.messages_simple.length > 0 ) {
				createErrorNotice( validationResponse.messages_simple.join( ' ' ), {
					id: 'tax-validation-error',
					type: 'snackbar',
				} );
				return;
			}

			// Display generic error if no specific messages
			createErrorNotice( __( 'Please check your billing address and try again.' ), {
				id: 'tax-validation-error',
				type: 'snackbar',
			} );
		},
		[ createErrorNotice, removeNotice ]
	);

	// Handler for domain contact validation errors
	const handleDomainValidationError = useCallback(
		( validationResponse: DomainContactValidationResponse ) => {
			if ( isAutoCompleting.current ) {
				return;
			}
			removeNotice( 'domain-validation-error' );

			if (
				! validationResponse.success &&
				validationResponse.messages_simple &&
				validationResponse.messages_simple.length > 0
			) {
				createErrorNotice( validationResponse.messages_simple.join( ' ' ), {
					id: 'domain-validation-error',
					type: 'snackbar',
				} );
				return;
			}

			createErrorNotice( __( 'Please check your domain contact details and try again.' ), {
				id: 'domain-validation-error',
				type: 'snackbar',
			} );
		},
		[ createErrorNotice, removeNotice ]
	);

	// Create payment methods
	const paymentMethods = useCreatePaymentMethods( { cartTotal, currency, siteId: site.ID } );

	// Transaction mutations
	const { mutateAsync: submitTransaction } = useMutation( submitTransactionMutation() );
	const { mutateAsync: confirmPayPalPPCP } = useMutation( confirmPayPalPPCPPaymentMutation() );
	const { mutateAsync: createSetupIntent } = useMutation( createStripeSetupIntentMutation() );
	const { mutateAsync: saveCard } = useMutation( saveCreditCardMutation() );

	// Payment processors
	const paymentProcessors = useMemo(
		() => ( {
			'existing-card': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				return existingCardProcessor(
					submitData as ExistingCardProcessorSubmitData,
					submitTransaction,
					{
						siteId: site.ID,
						responseCart,
						stripe,
						countryCode: taxLocation.country_code,
						postalCode: taxLocation.postal_code,
						subdivisionCode: taxLocation.subdivision_code,
						domainDetails: hasDomainProducts ? contactDetails : null,
					}
				);
			},
			'existing-card-ebanx': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				return existingCardProcessor(
					submitData as ExistingCardProcessorSubmitData,
					submitTransaction,
					{
						siteId: site.ID,
						responseCart,
						stripe,
						countryCode: taxLocation.country_code,
						postalCode: taxLocation.postal_code,
						subdivisionCode: taxLocation.subdivision_code,
						domainDetails: hasDomainProducts ? contactDetails : null,
					}
				);
			},
			card: async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				if ( ! stripe || ! stripeConfiguration ) {
					throw new Error( 'Stripe not loaded' );
				}
				// Add stripe and stripeConfiguration to submit data
				const cardSubmitData = {
					...( submitData as Record< string, unknown > ),
					stripe,
					stripeConfiguration,
				} as StripeCardProcessorSubmitData;

				return stripeCardProcessor( cardSubmitData, submitTransaction, {
					siteId: site.ID,
					responseCart,
					countryCode: taxLocation.country_code,
					postalCode: taxLocation.postal_code,
					subdivisionCode: taxLocation.subdivision_code,
					domainDetails: hasDomainProducts ? contactDetails : null,
					createSetupIntent,
					saveCreditCard: saveCard,
				} );
			},
			'paypal-js': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				const currentUrl = new URL( window.location.href );
				currentUrl.hash = '';
				const cancelUrl = currentUrl.toString();
				// PayPal requires absolute URLs; the pending page handles the actual
				// success state after the order is confirmed.
				const successUrl = cancelUrl;

				return payPalPPCPProcessor(
					submitData as PayPalPPCPSubmitData,
					submitTransaction,
					confirmPayPalPPCP,
					{
						siteId: site.ID,
						responseCart,
						countryCode: taxLocation.country_code,
						postalCode: taxLocation.postal_code,
						subdivisionCode: taxLocation.subdivision_code,
						successUrl,
						cancelUrl,
						domainDetails: hasDomainProducts ? contactDetails : null,
					}
				);
			},
			'existing-paypal-ppcp': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				return existingPayPalPPCPProcessor(
					submitData as ExistingPayPalPPCPSubmitData,
					submitTransaction,
					{
						siteId: site.ID,
						responseCart,
						countryCode: taxLocation.country_code,
						postalCode: taxLocation.postal_code,
						subdivisionCode: taxLocation.subdivision_code,
						domainDetails: hasDomainProducts ? contactDetails : null,
					}
				);
			},
			'free-purchase': async () => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				return freePurchaseProcessor( submitTransaction, {
					siteId: site.ID,
					responseCart,
					domainDetails: hasDomainProducts ? contactDetails : null,
				} );
			},
			'apple-pay': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				if ( ! stripe || ! stripeConfiguration ) {
					throw new Error( 'Stripe not loaded' );
				}
				return webPayProcessor( submitData as WebPayProcessorSubmitData, submitTransaction, {
					siteId: site.ID,
					responseCart,
					countryCode: taxLocation.country_code,
					postalCode: taxLocation.postal_code,
					domainDetails: hasDomainProducts ? contactDetails : null,
				} );
			},
			'google-pay': async ( submitData: unknown ) => {
				if ( ! responseCart ) {
					throw new Error( 'Cart not loaded' );
				}
				if ( ! stripe || ! stripeConfiguration ) {
					throw new Error( 'Stripe not loaded' );
				}
				return webPayProcessor( submitData as WebPayProcessorSubmitData, submitTransaction, {
					siteId: site.ID,
					responseCart,
					countryCode: taxLocation.country_code,
					postalCode: taxLocation.postal_code,
					domainDetails: hasDomainProducts ? contactDetails : null,
				} );
			},
		} ),
		[
			site,
			responseCart,
			taxLocation,
			contactDetails,
			hasDomainProducts,
			submitTransaction,
			confirmPayPalPPCP,
			stripe,
			stripeConfiguration,
			createSetupIntent,
			saveCard,
		]
	);

	const navigate = useNavigate();

	const handlePaymentComplete = useCallback(
		( response: unknown ) => {
			removeNotice( 'checkout-error' );
			const transactionResponse = ( response as { transactionLastResponse?: TransactionResponse } )
				?.transactionLastResponse;
			const orderId = transactionResponse?.order_id;

			if ( orderId ) {
				void navigate( {
					to: '/checkout/$siteSlug/pending/$orderId',
					params: { siteSlug: site.slug, orderId: String( orderId ) },
				} );
			} else {
				// Fallback: no order ID in response, show a generic success message.
				createSuccessNotice( __( 'Your purchase was successful.' ), {
					id: 'checkout-success',
					type: 'snackbar',
				} );
			}
		},
		[ navigate, removeNotice, createSuccessNotice, site.slug ]
	);

	const handlePaymentError = useCallback(
		( { transactionError }: { transactionError: string | null } ) => {
			removeNotice( 'checkout-success' );
			if ( transactionError ) {
				createErrorNotice( transactionError, {
					id: 'checkout-error',
					type: 'snackbar',
				} );
			} else {
				createErrorNotice( __( 'There was an error processing your payment. Please try again.' ), {
					id: 'checkout-error',
					type: 'snackbar',
				} );
			}
		},
		[ createErrorNotice, removeNotice ]
	);

	if ( cartLoadingError ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Checkout' ) } />
				<div>{ __( 'Error loading cart. Please try again.' ) }</div>
			</PageLayout>
		);
	}

	const isLoading = isLoadingCart || isAddingProductsFromUrl || paymentMethods.length === 0;

	return (
		<PageLayout>
			<PageHeader title={ __( 'Checkout' ) } />
			<CheckoutProvider
				paymentMethods={ paymentMethods }
				paymentProcessors={ paymentProcessors }
				onPaymentComplete={ handlePaymentComplete }
				onPaymentError={ handlePaymentError }
				isLoading={ isLoading }
				theme={ checkoutTheme }
				selectFirstAvailablePaymentMethod
			>
				<div className="dashboard-checkout">
					<div className="dashboard-checkout__main">
						<CheckoutStepGroup>
							<AutoCompleteSteps
								isReady={ isReadyToAutoComplete }
								onBeforeAttempt={ handleAutoCompleteStart }
								onAfterAttempt={ handleAutoCompleteEnd }
							/>
							<CheckoutStep
								stepId="review-order-step"
								isCompleteCallback={ () => true }
								activeStepContent={
									responseCart ? (
										<OrderReviewStepContent
											responseCart={ responseCart }
											removeProductFromCart={ removeProductFromCart }
											replaceProductInCart={ replaceProductInCart }
											applyCoupon={ applyCoupon }
											removeCoupon={ removeCoupon }
											couponStatus={ couponStatus }
										/>
									) : null
								}
								completeStepContent={
									responseCart ? <OrderReviewSummary responseCart={ responseCart } /> : null
								}
								titleContent={ <OrderReviewStepTitle /> }
							/>
							{ hasDomainProducts ? (
								// When the cart has domain products, the domain contact step replaces
								// the tax step — contact details contain all the billing info needed
								// (country, postal code, etc.) so we use them for both purposes.
								<CheckoutStep
									stepId="domain-contact-details-step"
									isCompleteCallback={ async () => {
										const domainNames = responseCart ? getDomainNamesFromCart( responseCart ) : [];
										const isValid = await validateDomainContactDetails(
											contactDetails,
											domainNames,
											handleDomainValidationError
										);
										if ( isValid ) {
											await updateLocation( getCartLocationFromContactDetails( contactDetails ) );
										}
										return isValid;
									} }
									activeStepContent={
										<DomainContactDetailsStepContent
											contactDetails={ contactDetails }
											onContactDetailsChange={ handleContactDetailsChange }
											domainNames={ responseCart ? getDomainNamesFromCart( responseCart ) : [] }
										/>
									}
									completeStepContent={
										<DomainContactDetailsSummary contactDetails={ contactDetails } />
									}
									titleContent={ <DomainContactDetailsStepTitle isAlsoBillingStep /> }
								/>
							) : (
								<CheckoutStep
									stepId="tax-information-step"
									isCompleteCallback={ () =>
										validateAndUpdateCartLocation(
											taxLocation,
											updateLocation,
											handleValidationError
										)
									}
									activeStepContent={
										<TaxInformationStepContent
											taxLocation={ taxLocation }
											onTaxLocationChange={ handleTaxLocationChange }
										/>
									}
									completeStepContent={ <TaxInformationSummary taxLocation={ taxLocation } /> }
									titleContent={ <TaxInformationStepTitle /> }
								/>
							) }
							<PaymentMethodStep />
							<CheckoutFormSubmit
								submitButtonHeader={
									responseCart ? (
										<CheckoutTerms cart={ responseCart } siteSlug={ site.slug } />
									) : null
								}
							/>
						</CheckoutStepGroup>
					</div>
					{ responseCart && (
						<aside className="dashboard-checkout__sidebar">
							<OrderSummary responseCart={ responseCart } />
						</aside>
					) }
				</div>
			</CheckoutProvider>
		</PageLayout>
	);
}
