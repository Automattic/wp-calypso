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
	createFullCreditsMethod,
	createFreePaymentMethod,
	createApplePayMethod,
	createExistingCardMethod,
} from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import {
	WordPressCreditsLabel,
	WordPressCreditsSummary,
	WordPressFreePurchaseLabel,
	WordPressFreePurchaseSummary,
} from './payment-method-helpers';
import { createWeChatMethod, createWeChatPaymentMethodStore } from './payment-methods/wechat';
import {
	createCreditCardPaymentMethodStore,
	createCreditCardMethod,
} from './payment-methods/credit-card';

function useCreatePayPal( { onlyLoadPaymentMethods } ) {
	const shouldLoadPayPalMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'paypal' )
		: true;
	const paypalMethod = useMemo( () => {
		if ( ! shouldLoadPayPalMethod ) {
			return null;
		}
		return createPayPalMethod();
	}, [ shouldLoadPayPalMethod ] );
	return paypalMethod;
}

function useCreateCreditCard( {
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

function useCreateAlipay( {
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'alipay' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods ? onlyLoadPaymentMethods.includes( 'p24' ) : true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'bancontact' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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

function useCreateGiropay( {
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'giropay' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	siteSlug,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'wechat' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'ideal' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'sofort' )
		: true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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
	onlyLoadPaymentMethods,
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
} ) {
	// If this PM is allowed by props, allowed by the cart, stripe is not loading, and there is no stripe error, then create the PM.
	const isMethodAllowed = onlyLoadPaymentMethods ? onlyLoadPaymentMethods.includes( 'eps' ) : true;
	const shouldLoad = isMethodAllowed && ! isStripeLoading && ! stripeLoadingError;
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

function useCreateFullCredits( { onlyLoadPaymentMethods, credits } ) {
	const shouldLoadFullCreditsMethod = onlyLoadPaymentMethods
		? onlyLoadPaymentMethods.includes( 'full-credits' )
		: true;
	const fullCreditsPaymentMethod = useMemo( () => {
		if ( ! shouldLoadFullCreditsMethod ) {
			return null;
		}
		return createFullCreditsMethod();
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
		return createFreePaymentMethod();
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
		return createApplePayMethod( stripe, stripeConfiguration );
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
				storedDetailsId: storedDetails.stored_details_id,
				paymentMethodToken: storedDetails.mp_ref,
				paymentPartnerProcessorId: storedDetails.payment_partner,
				stripeConfiguration,
			} )
		);
	}, [ stripeConfiguration, storedCards, shouldLoadExistingCardsMethods ] );
	return existingCardMethods;
}

export default function useCreatePaymentMethods( {
	onlyLoadPaymentMethods,
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
	const paypalMethod = useCreatePayPal( {
		onlyLoadPaymentMethods,
	} );

	const idealMethod = useCreateIdeal( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const alipayMethod = useCreateAlipay( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const p24Method = useCreateP24( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const bancontactMethod = useCreateBancontact( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const giropayMethod = useCreateGiropay( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const epsMethod = useCreateEps( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const sofortMethod = useCreateSofort( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
	} );

	const wechatMethod = useCreateWeChat( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
		siteSlug,
	} );

	const stripeMethod = useCreateCreditCard( {
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
		...existingCardMethods,
		applePayMethod,
		stripeMethod,
		paypalMethod,
		idealMethod,
		giropayMethod,
		sofortMethod,
		alipayMethod,
		p24Method,
		epsMethod,
		wechatMethod,
		bancontactMethod,
	].filter( Boolean );
}
