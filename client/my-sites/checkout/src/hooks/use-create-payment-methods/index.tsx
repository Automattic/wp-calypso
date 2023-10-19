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
	createIdealMethod,
	createIdealPaymentMethodStore,
	createSofortMethod,
	createSofortPaymentMethodStore,
	createAlipayMethod,
	createAlipayPaymentMethodStore,
	isValueTruthy,
} from '@automattic/wpcom-checkout';
import { useMemo } from 'react';
import { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { translateCheckoutPaymentMethodToWpcomPaymentMethod } from 'calypso/my-sites/checkout/src/lib/translate-payment-method-names';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { CheckoutSubmitButtonContent } from '../../components/checkout-submit-button-content';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from '../../payment-methods/credit-card';
import { createFreePaymentMethod } from '../../payment-methods/free-purchase';
import {
	createNetBankingPaymentMethodStore,
	createNetBankingMethod,
} from '../../payment-methods/netbanking';
import { createPayPalMethod, createPayPalStore } from '../../payment-methods/paypal';
import { createWeChatMethod, createWeChatPaymentMethodStore } from '../../payment-methods/wechat';
import useCreateExistingCards from './use-create-existing-cards';
import type { StripeConfiguration, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { CartKey } from '@automattic/shopping-cart';
import type { ContactDetailsType } from '@automattic/wpcom-checkout';
import type { Stripe } from '@stripe/stripe-js';
import type { ReactNode } from 'react';

export { useCreateExistingCards };

export function useCreatePayPal( {
	labelText,
	shouldShowTaxFields,
}: {
	labelText?: string | null;
	shouldShowTaxFields?: boolean;
} ): PaymentMethod {
	const store = useMemo( () => createPayPalStore(), [] );
	const paypalMethod = useMemo(
		() => createPayPalMethod( { labelText, store, shouldShowTaxFields } ),
		[ labelText, shouldShowTaxFields, store ]
	);
	return paypalMethod;
}

export function useCreateCreditCard( {
	isStripeLoading,
	stripeLoadingError,
	shouldUseEbanx,
	shouldShowTaxFields,
	submitButtonContent,
	initialUseForAllSubscriptions,
	allowUseForAllSubscriptions,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	shouldUseEbanx: boolean;
	shouldShowTaxFields?: boolean;
	submitButtonContent: ReactNode;
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
						shouldUseEbanx,
						shouldShowTaxFields,
						submitButtonContent,
						allowUseForAllSubscriptions,
				  } )
				: null,
		[
			shouldLoadStripeMethod,
			stripePaymentMethodStore,
			shouldUseEbanx,
			shouldShowTaxFields,
			submitButtonContent,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore ]
	);
}

function useCreateWeChat( {
	isStripeLoading,
	stripeLoadingError,
	siteSlug,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	siteSlug?: string | undefined;
} ): PaymentMethod | null {
	const shouldLoad = ! isStripeLoading && ! stripeLoadingError;
	const paymentMethodStore = useMemo( () => createWeChatPaymentMethodStore(), [] );
	return useMemo(
		() =>
			shouldLoad
				? createWeChatMethod( {
						store: paymentMethodStore,
						siteSlug,
				  } )
				: null,
		[ shouldLoad, paymentMethodStore, siteSlug ]
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
						submitButtonContent: <CheckoutSubmitButtonContent />,
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
				submitButtonContent: <CheckoutSubmitButtonContent />,
			} ),
		[ paymentMethodStore ]
	);
}

function useCreateFree() {
	return useMemo( createFreePaymentMethod, [] );
}

function useCreateApplePay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	cartKey,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	cartKey: CartKey | undefined;
} ): PaymentMethod | null {
	const isStripeReady = ! isStripeLoading && ! stripeLoadingError && stripe && stripeConfiguration;
	const shouldCreateApplePayMethod = isStripeReady;

	const applePayMethod = useMemo( () => {
		return shouldCreateApplePayMethod && stripe && stripeConfiguration && cartKey
			? createApplePayMethod( stripe, stripeConfiguration, cartKey )
			: null;
	}, [ shouldCreateApplePayMethod, stripe, stripeConfiguration, cartKey ] );

	return applePayMethod;
}

function useCreateGooglePay( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	cartKey,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	cartKey: CartKey | undefined;
} ): PaymentMethod | null {
	const isStripeReady =
		! isStripeLoading &&
		! stripeLoadingError &&
		stripe &&
		stripeConfiguration &&
		isEnabled( 'checkout/google-pay' );

	return useMemo( () => {
		return isStripeReady && stripe && stripeConfiguration && cartKey
			? createGooglePayMethod( stripe, stripeConfiguration, cartKey )
			: null;
	}, [ stripe, stripeConfiguration, isStripeReady, cartKey ] );
}

export default function useCreatePaymentMethods( {
	contactDetailsType,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	storedCards,
	siteSlug,
}: {
	contactDetailsType: ContactDetailsType;
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	storedCards: StoredPaymentMethod[];
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

	const netbankingMethod = useCreateNetbanking();

	const sofortMethod = useCreateSofort( {
		isStripeLoading,
		stripeLoadingError,
	} );

	const wechatMethod = useCreateWeChat( {
		isStripeLoading,
		stripeLoadingError,
		siteSlug,
	} );

	const shouldUseEbanx = responseCart.allowed_payment_methods.includes(
		translateCheckoutPaymentMethodToWpcomPaymentMethod( 'ebanx' ) ?? ''
	);
	const allowUseForAllSubscriptions = true;
	// Normally checkout will get the tax contact information from the contact
	// step. However, if the contact step is not shown, we need to collect it
	// in the credit card form instead.
	const shouldShowTaxFields = contactDetailsType === 'none';
	const stripeMethod = useCreateCreditCard( {
		shouldShowTaxFields,
		isStripeLoading,
		stripeLoadingError,
		shouldUseEbanx,
		allowUseForAllSubscriptions,
		submitButtonContent: <CheckoutSubmitButtonContent />,
	} );

	const freePaymentMethod = useCreateFree();

	const applePayMethod = useCreateApplePay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		cartKey,
	} );

	const googlePayMethod = useCreateGooglePay( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		cartKey,
	} );

	const existingCardMethods = useCreateExistingCards( {
		isStripeLoading,
		stripeLoadingError,
		storedCards,
		submitButtonContent: <CheckoutSubmitButtonContent />,
	} );

	// The order is the order of Payment Methods in Checkout.
	return [
		...existingCardMethods,
		applePayMethod,
		googlePayMethod,
		stripeMethod,
		freePaymentMethod,
		paypalMethod,
		idealMethod,
		giropayMethod,
		sofortMethod,
		netbankingMethod,
		alipayMethod,
		p24Method,
		epsMethod,
		wechatMethod,
		bancontactMethod,
	].filter( isValueTruthy );
}
