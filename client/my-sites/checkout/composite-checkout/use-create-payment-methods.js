/**
 * External dependencies
 */
import React, { useMemo } from 'react';
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
	createFreePaymentMethod,
	createApplePayMethod,
	createExistingCardMethod,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { WordPressFreePurchaseLabel, WordPressFreePurchaseSummary } from './payment-method-helpers';
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

function useCreatePayPal() {
	const paypalMethod = useMemo( createPayPalMethod, [] );
	return paypalMethod;
}

function useCreateCreditCard( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
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
				  } )
				: null,
		[ shouldLoadStripeMethod, stripePaymentMethodStore, stripe, stripeConfiguration ]
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

function useCreateFullCredits( { credits } ) {
	return useMemo( () => createFullCreditsMethod( { credits } ), [ credits ] );
}

function useCreateFree() {
	const freePaymentMethod = useMemo( createFreePaymentMethod, [] );
	freePaymentMethod.label = <WordPressFreePurchaseLabel />;
	freePaymentMethod.inactiveContent = <WordPressFreePurchaseSummary />;
	return freePaymentMethod;
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

function useCreateExistingCards( { storedCards, stripeConfiguration } ) {
	const existingCardMethods = useMemo( () => {
		return storedCards.map( ( storedDetails ) =>
			createExistingCardMethod( {
				id: `existingCard-${ storedDetails.stored_details_id }`,
				cardholderName: storedDetails.name,
				cardExpiry: storedDetails.expiry,
				brand: storedDetails.card_type,
				last4: storedDetails.card,
				storedDetailsId: storedDetails.stored_details_id,
				paymentMethodToken: storedDetails.mp_ref,
				paymentPartnerProcessorId: storedDetails.payment_partner,
				stripeConfiguration,
			} )
		);
	}, [ stripeConfiguration, storedCards ] );
	return existingCardMethods;
}

export default function useCreatePaymentMethods( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	credits,
	isApplePayAvailable,
	isApplePayLoading,
	storedCards,
	siteSlug,
} ) {
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

	const stripeMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const fullCreditsPaymentMethod = useCreateFullCredits( {
		credits,
	} );

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
