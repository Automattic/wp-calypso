/**
 * External dependencies
 */
import React, { useMemo } from 'react';
import {
	createPayPalMethod,
	createStripePaymentMethodStore,
	createStripeMethod,
	createGiropayMethod,
	createGiropayPaymentMethodStore,
	createIdealMethod,
	createIdealPaymentMethodStore,
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
	const stripePaymentMethodStore = useMemo( () => createStripePaymentMethodStore(), [] );
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
	return stripeMethod;
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

	const giropayMethod = useCreateGiropay( {
		onlyLoadPaymentMethods,
		isStripeLoading,
		stripeLoadingError,
		stripeConfiguration,
		stripe,
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
		...existingCardMethods,
		applePayMethod,
		idealMethod,
		giropayMethod,
		stripeMethod,
		paypalMethod,
	].filter( Boolean );
}
