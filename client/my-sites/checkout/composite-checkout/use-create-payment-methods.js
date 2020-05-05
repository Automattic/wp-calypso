/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import {
	createPayPalMethod,
	createStripePaymentMethodStore,
	createStripeMethod,
	createFullCreditsMethod,
	createFreePaymentMethod,
	createApplePayMethod,
	createExistingCardMethod,
	registerStore,
	defaultRegistry,
} from '@automattic/composite-checkout';
import { format as formatUrl, parse as parseUrl } from 'url';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import {
	makePayPalExpressRequest,
	wpcomPayPalExpress,
	getDomainDetails,
	sendStripeTransaction,
	wpcomTransaction,
	submitCreditsTransaction,
	WordPressCreditsLabel,
	WordPressCreditsSummary,
	submitFreePurchaseTransaction,
	WordPressFreePurchaseLabel,
	WordPressFreePurchaseSummary,
	submitApplePayPayment,
	submitExistingCardPayment,
} from './payment-method-helpers';

const debug = debugFactory( 'calypso:composite-checkout:use-create-payment-methods' );
const { select, dispatch } = defaultRegistry;

function useCreatePayPal( { onlyLoadPaymentMethods, getThankYouUrl, getItems, getCouponItem } ) {
	const shouldLoadPayPalMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'paypal' )
		: true;
	const paypalMethod = useMemo( () => {
		if ( ! shouldLoadPayPalMethod ) {
			return null;
		}
		return createPayPalMethod( { registerStore } );
	}, [ shouldLoadPayPalMethod ] );
	if ( paypalMethod ) {
		paypalMethod.id = 'paypal';
		// This is defined afterward so that getThankYouUrl can be dynamic without having to re-create payment method
		paypalMethod.submitTransaction = () => {
			const { protocol, hostname, port, pathname } = parseUrl( window.location.href, true );
			const successUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname: getThankYouUrl(),
			} );
			const cancelUrl = formatUrl( {
				protocol,
				hostname,
				port,
				pathname,
			} );

			return makePayPalExpressRequest(
				{
					items: getItems(),
					successUrl,
					cancelUrl,
					siteId: select( 'wpcom' )?.getSiteId?.() ?? '',
					domainDetails: getDomainDetails( select ),
					couponId: getCouponItem()?.wpcom_meta?.couponCode,
					country: select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value ?? '',
					postalCode: select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value ?? '',
					subdivisionCode: select( 'wpcom' )?.getContactInfo?.()?.state?.value ?? '',
				},
				wpcomPayPalExpress
			);
		};
	}
	return paypalMethod;
}

function useCreateStripe( {
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isStripeMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'card' )
		: true;
	const shouldLoadStripeMethod = isStripeMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo(
		() =>
			createStripePaymentMethodStore( {
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
				getSiteId: () => select( 'wpcom' )?.getSiteId?.(),
				getDomainDetails: () => getDomainDetails( select ),
				submitTransaction: ( submitData ) => {
					const pending = sendStripeTransaction( submitData, wpcomTransaction );
					// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
					pending.then( ( result ) => {
						debug( 'saving transaction response', result );
						dispatch( 'wpcom' ).setTransactionResponse( result );
					} );
					return pending;
				},
			} ),
		[]
	);
	const stripeMethod = useMemo(
		() =>
			shouldLoadStripeMethod
				? createStripeMethod( {
						store: stripePaymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoadStripeMethod, stripePaymentMethodStore, stripe, stripeConfiguration ]
	);
	if ( stripeMethod ) {
		stripeMethod.id = 'card';
	}
	return stripeMethod;
}

function useCreateFullCredits( { onlyLoadPaymentMethods, credits } ) {
	const shouldLoadFullCreditsMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'full-credits' )
		: true;
	const fullCreditsPaymentMethod = useMemo( () => {
		if ( ! shouldLoadFullCreditsMethod ) {
			return null;
		}
		return createFullCreditsMethod( {
			registerStore,
			submitTransaction: ( submitData ) => {
				const pending = submitCreditsTransaction(
					{
						...submitData,
						siteId: select( 'wpcom' )?.getSiteId?.(),
						domainDetails: getDomainDetails( select ),
						// this data is intentionally empty so we do not charge taxes
						country: null,
						postalCode: null,
					},
					wpcomTransaction
				);
				// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
				pending.then( ( result ) => {
					debug( 'saving transaction response', result );
					dispatch( 'wpcom' ).setTransactionResponse( result );
				} );
				return pending;
			},
		} );
	}, [ shouldLoadFullCreditsMethod ] );
	if ( fullCreditsPaymentMethod ) {
		fullCreditsPaymentMethod.label = <WordPressCreditsLabel credits={ credits } />;
		fullCreditsPaymentMethod.inactiveContent = <WordPressCreditsSummary />;
	}
	return fullCreditsPaymentMethod;
}

function useCreateFree( { onlyLoadPaymentMethods } ) {
	const shouldLoadFreePaymentMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'free-purchase' )
		: true;
	const freePaymentMethod = useMemo( () => {
		if ( ! shouldLoadFreePaymentMethod ) {
			return null;
		}
		return createFreePaymentMethod( {
			registerStore,
			submitTransaction: ( submitData ) => {
				const pending = submitFreePurchaseTransaction(
					{
						...submitData,
						siteId: select( 'wpcom' )?.getSiteId?.(),
						domainDetails: getDomainDetails( select ),
						// this data is intentionally empty so we do not charge taxes
						country: null,
						postalCode: null,
					},
					wpcomTransaction
				);
				// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
				pending.then( ( result ) => {
					debug( 'saving transaction response', result );
					dispatch( 'wpcom' ).setTransactionResponse( result );
				} );
				return pending;
			},
		} );
	}, [ shouldLoadFreePaymentMethod ] );
	if ( freePaymentMethod ) {
		freePaymentMethod.label = <WordPressFreePurchaseLabel />;
		freePaymentMethod.inactiveContent = <WordPressFreePurchaseSummary />;
	}
	return freePaymentMethod;
}

function useCreateApplePay( {
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	isApplePayAvailable,
	isApplePayLoading,
} ) {
	const shouldLoadApplePay = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'apple-pay' ) && isApplePayAvailable
		: isApplePayAvailable;
	const applePayMethod = useMemo( () => {
		if (
			! shouldLoadApplePay ||
			isStripeLoading ||
			stripeLoadingError ||
			! stripe ||
			! stripeConfiguration ||
			isApplePayLoading ||
			! isApplePayAvailable
		) {
			return null;
		}
		return createApplePayMethod( {
			getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
			getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
			registerStore,
			submitTransaction: ( submitData ) => {
				const pending = submitApplePayPayment(
					{
						...submitData,
						siteId: select( 'wpcom' )?.getSiteId?.(),
						domainDetails: getDomainDetails( select ),
					},
					wpcomTransaction
				);
				// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
				pending.then( ( result ) => {
					debug( 'saving transaction response', result );
					dispatch( 'wpcom' ).setTransactionResponse( result );
				} );
				return pending;
			},
			stripe,
			stripeConfiguration,
		} );
	}, [
		shouldLoadApplePay,
		isApplePayLoading,
		stripe,
		stripeConfiguration,
		isStripeLoading,
		stripeLoadingError,
		isApplePayAvailable,
	] );
	return applePayMethod;
}

function useCreateExistingCards( { onlyLoadPaymentMethods, storedCards, stripeConfiguration } ) {
	const shouldLoadExistingCardsMethods = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'existingCard' )
		: true;
	const existingCardMethods = useMemo( () => {
		if ( ! shouldLoadExistingCardsMethods ) {
			return [];
		}
		return storedCards.map( ( storedDetails ) =>
			createExistingCardMethod( {
				id: `existingCard-${ storedDetails.stored_details_id }`,
				cardholderName: storedDetails.name,
				cardExpiry: storedDetails.expiry,
				brand: storedDetails.card_type,
				last4: storedDetails.card,
				stripeConfiguration,
				submitTransaction: ( submitData ) => {
					const pending = submitExistingCardPayment(
						{
							...submitData,
							siteId: select( 'wpcom' )?.getSiteId?.(),
							storedDetailsId: storedDetails.stored_details_id,
							paymentMethodToken: storedDetails.mp_ref,
							paymentPartnerProcessorId: storedDetails.payment_partner,
							domainDetails: getDomainDetails( select ),
						},
						wpcomTransaction
					);
					// save result so we can get receipt_id and failed_purchases in getThankYouPageUrl
					pending.then( ( result ) => {
						debug( 'saving transaction response', result );
						dispatch( 'wpcom' ).setTransactionResponse( result );
					} );
					return pending;
				},
				registerStore,
				getCountry: () => select( 'wpcom' )?.getContactInfo?.()?.countryCode?.value,
				getPostalCode: () => select( 'wpcom' )?.getContactInfo?.()?.postalCode?.value,
				getSubdivisionCode: () => select( 'wpcom' )?.getContactInfo?.()?.state?.value,
			} )
		);
	}, [ stripeConfiguration, storedCards, shouldLoadExistingCardsMethods ] );
	return existingCardMethods;
}

export default function useCreatePaymentMethods( {
	onlyLoadPaymentMethods,
	getThankYouUrl,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	credits,
	items,
	couponItem,
	isApplePayAvailable,
	isApplePayLoading,
	storedCards,
} ) {
	const paypalMethod = useCreatePayPal( {
		onlyLoadPaymentMethods,
		getThankYouUrl,
		getItems: () => items,
		getCouponItem: () => couponItem,
	} );

	const stripeMethod = useCreateStripe( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const fullCreditsPaymentMethod = useCreateFullCredits( {
		onlyLoadPaymentMethods,
		credits,
	} );

	const freePaymentMethod = useCreateFree( { onlyLoadPaymentMethods } );

	const applePayMethod = useCreateApplePay( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isApplePayAvailable,
		isApplePayLoading,
	} );

	const existingCardMethods = useCreateExistingCards( {
		onlyLoadPaymentMethods,
		storedCards,
		stripeConfiguration,
	} );

	return [
		freePaymentMethod,
		fullCreditsPaymentMethod,
		applePayMethod,
		...existingCardMethods,
		stripeMethod,
		paypalMethod,
	].filter( Boolean );
}
