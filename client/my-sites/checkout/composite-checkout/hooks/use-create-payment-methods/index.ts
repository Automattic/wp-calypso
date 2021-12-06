import { isEnabled } from '@automattic/calypso-config';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	createApplePayMethod,
	createGooglePayMethod,
	createBancontactMethod,
	createBancontactPaymentMethodStore,
	createGiropayMethod,
	createGiropayPaymentMethodStore,
	createP24Method,
	createP24PaymentMethodStore,
	createEpsMethod,
	createEpsPaymentMethodStore,
	createPayPalMethod,
	createIdealMethod,
	createIdealPaymentMethodStore,
	createSofortMethod,
	createSofortPaymentMethodStore,
	createAlipayMethod,
	createAlipayPaymentMethodStore,
	isValueTruthy,
} from '@automattic/wpcom-checkout';
import { useMemo } from 'react';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from '../../payment-methods/credit-card';
import {
	createEbanxTefPaymentMethodStore,
	createEbanxTefMethod,
} from '../../payment-methods/ebanx-tef';
import { createFreePaymentMethod } from '../../payment-methods/free-purchase';
import { createFullCreditsMethod } from '../../payment-methods/full-credits';
import {
	createNetBankingPaymentMethodStore,
	createNetBankingMethod,
} from '../../payment-methods/netbanking';
import { createWeChatMethod, createWeChatPaymentMethodStore } from '../../payment-methods/wechat';
import useCreateExistingCards from './use-create-existing-cards';
import type { StoredCard } from '../../types/stored-cards';
import type { StripeConfiguration, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export { useCreateExistingCards };

export function useCreatePayPal( { labelText }: { labelText?: string | null } ): PaymentMethod {
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
	initialUseForAllSubscriptions,
	allowUseForAllSubscriptions,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	shouldUseEbanx: boolean;
	shouldShowTaxFields?: boolean;
	activePayButtonText?: string | undefined;
	initialUseForAllSubscriptions?: boolean;
	allowUseForAllSubscriptions?: boolean;
} ): PaymentMethod | null {
	const shouldLoadStripeMethod = ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo(
		() =>
			createCreditCardPaymentMethodStore( {
				initialUseForAllSubscriptions,
				allowUseForAllSubscriptions,
			} ),
		[ initialUseForAllSubscriptions, allowUseForAllSubscriptions ]
	);
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
						allowUseForAllSubscriptions,
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
			allowUseForAllSubscriptions,
		]
	);
	return stripeMethod;
}

function useCreateAlipay( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createAlipayPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createAlipayMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateP24( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createP24PaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createP24Method( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateBancontact( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createBancontactPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createBancontactMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateGiropay( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createGiropayPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createGiropayMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateWeChat( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	siteSlug,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	siteSlug?: string | undefined;
} ): PaymentMethod | null {
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

function useCreateIdeal( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createIdealPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createIdealMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateSofort( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createSofortPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createSofortMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateEps( {
	isStripeLoading,
	stripeLoadingError,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createEpsPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createEpsMethod( {
						store: paymentMethodStore,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateNetbanking(): PaymentMethod {
	const paymentMethodStore = useMemo( () => createNetBankingPaymentMethodStore(), [] );
	return useMemo(
		() =>
			createNetBankingMethod( {
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
	isWebPayLoading,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	isApplePayAvailable: boolean;
	isWebPayLoading: boolean;
} ): PaymentMethod | null {
	const isStripeReady = ! isStripeLoading && ! stripeLoadingError && stripe && stripeConfiguration;

	const shouldCreateApplePayMethod = isStripeReady && ! isWebPayLoading && isApplePayAvailable;

	const applePayMethod = useMemo( () => {
		return shouldCreateApplePayMethod && stripe && stripeConfiguration
			? createApplePayMethod( stripe, stripeConfiguration )
			: null;
	}, [ shouldCreateApplePayMethod, stripe, stripeConfiguration ] );

	return applePayMethod;
}

function useCreateGooglePay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	isGooglePayAvailable,
	isWebPayLoading,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	isGooglePayAvailable: boolean;
	isWebPayLoading: boolean;
} ): PaymentMethod | null {
	const isStripeReady =
		! isStripeLoading &&
		! stripeLoadingError &&
		! isWebPayLoading &&
		stripe &&
		stripeConfiguration &&
		isGooglePayAvailable &&
		isEnabled( 'checkout/google-pay' );

	return useMemo( () => {
		return isStripeReady && stripe && stripeConfiguration
			? createGooglePayMethod( stripe, stripeConfiguration )
			: null;
	}, [ stripe, stripeConfiguration, isStripeReady ] );
}

export default function useCreatePaymentMethods( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	isApplePayAvailable,
	isGooglePayAvailable,
	isWebPayLoading,
	storedCards,
	siteSlug,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	isApplePayAvailable: boolean;
	isGooglePayAvailable: boolean;
	isWebPayLoading: boolean;
	storedCards: StoredCard[];
	siteSlug: string | undefined;
} ): PaymentMethod[] {
	const cartKey = useCartKey();
	const { responseCart } = useShoppingCart( cartKey );

	const paypalMethod = useCreatePayPal( {} );

	const idealMethod = useCreateIdeal( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const alipayMethod = useCreateAlipay( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const p24Method = useCreateP24( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const bancontactMethod = useCreateBancontact( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const giropayMethod = useCreateGiropay( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const epsMethod = useCreateEps( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const ebanxTefMethod = useCreateEbanxTef();

	const netbankingMethod = useCreateNetbanking();

	const sofortMethod = useCreateSofort( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const wechatMethod = useCreateWeChat( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		siteSlug,
	} );

	const shouldUseEbanx = responseCart.allowed_payment_methods.includes(
		translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' ) ?? ''
	);
	const allowUseForAllSubscriptions = true;
	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		shouldUseEbanx,
		allowUseForAllSubscriptions,
	} );

	const fullCreditsPaymentMethod = useCreateFullCredits();

	const freePaymentMethod = useCreateFree();

	const applePayMethod = useCreateApplePay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isApplePayAvailable,
		isWebPayLoading,
	} );

	const googlePayMethod = useCreateGooglePay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		isGooglePayAvailable,
		isWebPayLoading,
	} );

	const existingCardMethods = useCreateExistingCards( {
		isStripeLoading,
		stripeLoadingError,
		storedCards,
	} );

	return [
		freePaymentMethod,
		fullCreditsPaymentMethod,
		...existingCardMethods,
		applePayMethod,
		googlePayMethod,
		stripeMethod,
		paypalMethod,
		idealMethod,
		giropayMethod,
		sofortMethod,
		ebanxTefMethod,
		netbankingMethod,
		alipayMethod,
		p24Method,
		epsMethod,
		wechatMethod,
		bancontactMethod,
	].filter( isValueTruthy );
}
