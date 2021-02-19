/**
 * External dependencies
 */
import { useMemo, useRef, useEffect } from 'react';
import {
	createPayPalMethod,
	createAlipayMethod,
	createAlipayPaymentMethodStore,
	createBancontactMethod,
	createBancontactPaymentMethodStore,
	createGiropayMethod,
	createGiropayPaymentMethodStore,
	createP24Method,
	createP24PaymentMethodStore,
	createIdealMethod,
	createIdealPaymentMethodStore,
	createSofortMethod,
	createSofortPaymentMethodStore,
	createEpsMethod,
	createEpsPaymentMethodStore,
	createApplePayMethod,
	createExistingCardMethod,
} from '@automattic/composite-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { createWeChatMethod, createWeChatPaymentMethodStore } from './payment-methods/wechat';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from './payment-methods/credit-card';
import {
	createEbanxTefPaymentMethodStore,
	createEbanxTefMethod,
} from './payment-methods/ebanx-tef';
import {
	createIdWalletPaymentMethodStore,
	createIdWalletMethod,
} from './payment-methods/id-wallet';
import {
	createNetBankingPaymentMethodStore,
	createNetBankingMethod,
} from './payment-methods/netbanking';
import { createFullCreditsMethod } from './payment-methods/full-credits';
import { createFreePaymentMethod } from './payment-methods/free-purchase';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';

export function useCreatePayPal( { labelText = null } = {} ) {
	const paypalMethod = useMemo( () => createPayPalMethod( { labelText } ), [ labelText ] );
	return paypalMethod;
}

export function useCreateCreditCard( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	shouldUseEbanx,
	shouldShowTaxFields = false,
	activePayButtonText = undefined,
} ) {
	const shouldLoadStripeMethod = ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo( () => createCreditCardPaymentMethodStore(), [] );
	const stripeMethod = useMemo(
		() =>
			shouldLoadStripeMethod
				? createCreditCardMethod( {
						store: stripePaymentMethodStore,
						stripe,
						stripeConfiguration,
						shouldUseEbanx,
						shouldShowTaxFields,
						activePayButtonText,
				  } )
				: null,
		[
			shouldLoadStripeMethod,
			stripePaymentMethodStore,
			stripe,
			stripeConfiguration,
			shouldUseEbanx,
			shouldShowTaxFields,
			activePayButtonText,
		]
	);
	return stripeMethod;
}

function useCreateAlipay( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createAlipayPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createAlipayMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateP24( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createP24PaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createP24Method( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateBancontact( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createBancontactPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createBancontactMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateGiropay( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createGiropayPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createGiropayMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateWeChat( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	siteSlug,
} ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createWeChatPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createWeChatMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
						siteSlug,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration, siteSlug ]
	);
}

function useCreateIdeal( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createIdealPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createIdealMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateSofort( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createSofortPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createSofortMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateEps( { isStripeLoading, stripeLoadingError, stripeConfiguration, stripe } ) {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createEpsPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createEpsMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateNetbanking() {
	const paymentMethodStore = useMemo( () => createNetBankingPaymentMethodStore(), [] );
	return useMemo(
		() =>
			createNetBankingMethod( {
				store: paymentMethodStore,
			} ),
		[ paymentMethodStore ]
	);
}

function useCreateIdWallet() {
	const paymentMethodStore = useMemo( () => createIdWalletPaymentMethodStore(), [] );
	return useMemo(
		() =>
			createIdWalletMethod( {
				store: paymentMethodStore,
			} ),
		[ paymentMethodStore ]
	);
}

function useCreateEbanxTef() {
	const paymentMethodStore = useMemo( () => createEbanxTefPaymentMethodStore(), [] );
	return useMemo(
		() =>
			createEbanxTefMethod( {
				store: paymentMethodStore,
			} ),
		[ paymentMethodStore ]
	);
}

function useCreateFullCredits() {
	return useMemo( () => createFullCreditsMethod(), [] );
}

function useCreateFree() {
	return useMemo( createFreePaymentMethod, [] );
}

function useCreateApplePay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	isApplePayAvailable,
	isApplePayLoading,
} ) {
	const isStripeReady = ! isStripeLoading && ! stripeLoadingError && stripe && stripeConfiguration;

	const shouldCreateApplePayMethod = isStripeReady && ! isApplePayLoading && isApplePayAvailable;

	const applePayMethod = useMemo( () => {
		return shouldCreateApplePayMethod ? createApplePayMethod( stripe, stripeConfiguration ) : null;
	}, [ shouldCreateApplePayMethod, stripe, stripeConfiguration ] );

	return applePayMethod;
}

// See https://usehooks.com/useMemoCompare/
function useMemoCompare( next, compare ) {
	// Ref for storing previous value
	const previousRef = useRef();
	const previous = previousRef.current;

	// Pass previous and next value to compare function
	// to determine whether to consider them equal.
	const isEqual = compare( previous, next );

	// If not equal update previousRef to next value.
	// We only update if not equal so that this hook continues to return
	// the same old value if compare keeps returning true.
	useEffect( () => {
		if ( ! isEqual ) {
			previousRef.current = next;
		}
	} );

	// Finally, if equal then return the previous value
	return isEqual ? previous : next;
}

export function useCreateExistingCards( { storedCards, activePayButtonText = undefined } ) {
	// Memoize the cards by comparing their stored_details_id values, in case the
	// objects are recreated on each render.
	const memoizedStoredCards = useMemoCompare( storedCards, ( prev, next ) => {
		const prevIds = prev?.map( ( card ) => card.stored_details_id ) ?? [];
		const nextIds = next?.map( ( card ) => card.stored_details_id ) ?? [];
		return (
			prevIds.length === nextIds.length && prevIds.every( ( id, index ) => id === nextIds[ index ] )
		);
	} );
	const existingCardMethods = useMemo( () => {
		return (
			memoizedStoredCards?.map( ( storedDetails ) =>
				createExistingCardMethod( {
					id: `existingCard-${ storedDetails.stored_details_id }`,
					cardholderName: storedDetails.name,
					cardExpiry: storedDetails.expiry,
					brand: storedDetails.card_type,
					last4: storedDetails.card,
					storedDetailsId: storedDetails.stored_details_id,
					paymentMethodToken: storedDetails.mp_ref,
					paymentPartnerProcessorId: storedDetails.payment_partner,
					activePayButtonText,
				} )
			) ?? []
		);
	}, [ memoizedStoredCards, activePayButtonText ] );
	return existingCardMethods;
}

export default function useCreatePaymentMethods( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	isApplePayAvailable,
	isApplePayLoading,
	storedCards,
	siteSlug,
} ) {
	const { responseCart } = useShoppingCart();

	const paypalMethod = useCreatePayPal();

	const idealMethod = useCreateIdeal( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const alipayMethod = useCreateAlipay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const p24Method = useCreateP24( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const bancontactMethod = useCreateBancontact( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const giropayMethod = useCreateGiropay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const epsMethod = useCreateEps( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const ebanxTefMethod = useCreateEbanxTef();

	const idWalletMethod = useCreateIdWallet();

	const netbankingMethod = useCreateNetbanking();

	const sofortMethod = useCreateSofort( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const wechatMethod = useCreateWeChat( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		siteSlug,
	} );

	const shouldUseEbanx = Boolean(
		responseCart?.allowed_payment_methods?.includes(
			translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' )
		)
	);
	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx,
	} );

	const fullCreditsPaymentMethod = useCreateFullCredits();

	const freePaymentMethod = useCreateFree();

	const applePayMethod = useCreateApplePay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isApplePayAvailable,
		isApplePayLoading,
	} );

	const existingCardMethods = useCreateExistingCards( {
		storedCards,
		stripeConfiguration,
	} );

	return [
		freePaymentMethod,
		fullCreditsPaymentMethod,
		...existingCardMethods,
		applePayMethod,
		stripeMethod,
		paypalMethod,
		idealMethod,
		giropayMethod,
		sofortMethod,
		ebanxTefMethod,
		idWalletMethod,
		netbankingMethod,
		alipayMethod,
		p24Method,
		epsMethod,
		wechatMethod,
		bancontactMethod,
	].filter( Boolean );
}
