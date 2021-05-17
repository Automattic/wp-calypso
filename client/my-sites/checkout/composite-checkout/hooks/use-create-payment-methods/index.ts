/**
 * External dependencies
 */
import { useMemo } from 'react';
import { isEnabled } from '@automattic/calypso-config';
import {
	createPayPalMethod,
	createAlipayMethod,
	createAlipayPaymentMethodStore,
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
} from '@automattic/composite-checkout';
import {
	createApplePayMethod,
	createGooglePayMethod,
	createBancontactMethod,
	createBancontactPaymentMethodStore,
} from '@automattic/wpcom-checkout';
import { useShoppingCart } from '@automattic/shopping-cart';
import type { StripeConfiguration, Stripe, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { createWeChatMethod, createWeChatPaymentMethodStore } from '../../payment-methods/wechat';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from '../../payment-methods/credit-card';
import {
	createEbanxTefPaymentMethodStore,
	createEbanxTefMethod,
} from '../../payment-methods/ebanx-tef';
import {
	createIdWalletPaymentMethodStore,
	createIdWalletMethod,
} from '../../payment-methods/id-wallet';
import {
	createNetBankingPaymentMethodStore,
	createNetBankingMethod,
} from '../../payment-methods/netbanking';
import { createFullCreditsMethod } from '../../payment-methods/full-credits';
import { createFreePaymentMethod } from '../../payment-methods/free-purchase';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-payment-method-names';
import useCreateExistingCards from './use-create-existing-cards';
import doesValueExist from '../../lib/does-value-exist';
import type { StoredCard } from '../../types/stored-cards';

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
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	shouldUseEbanx: boolean;
	shouldShowTaxFields?: boolean;
	activePayButtonText?: string | undefined;
} ): PaymentMethod | null {
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

function useCreateAlipay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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

function useCreateP24( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createBancontactPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad && stripe && stripeConfiguration
				? createBancontactMethod( {
						store: paymentMethodStore,
						stripe,
						stripeConfiguration,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, stripe, stripeConfiguration ]
	);
}

function useCreateGiropay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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

function useCreateSofort( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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

function useCreateEps( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
} ): PaymentMethod | null {
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

function useCreateIdWallet(): PaymentMethod {
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
	const { responseCart } = useShoppingCart();

	const paypalMethod = useCreatePayPal( {} );

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
			translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' ) ?? ''
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
		idWalletMethod,
		netbankingMethod,
		alipayMethod,
		p24Method,
		epsMethod,
		wechatMethod,
		bancontactMethod,
	].filter( doesValueExist );
}
