import { useMemo } from 'react';
import type { CheckoutType } from '@automattic/composite-checkout';

interface Props {
	hasJetpackSiteSlug: boolean;
	checkoutType: CheckoutType;
	isJetpackNotAtomic: boolean;
	isLoggedOutCart?: boolean;
	isUserComingFromLoginForm?: boolean;
}

export default function useCheckoutFlowTrackKey( {
	hasJetpackSiteSlug,
	checkoutType, // the value of 'jetpack' is used for both "siteless checkout" and "site-only(userless) checkout"
	isJetpackNotAtomic,
	isLoggedOutCart,
	isUserComingFromLoginForm,
}: Props ): string {
	return useMemo( () => {
		const isSitelessJetpackCheckout = checkoutType === 'jetpack' && ! hasJetpackSiteSlug;

		if ( checkoutType === 'jetpack' ) {
			if ( isUserComingFromLoginForm ) {
				// this allows us to track the flow: Checkout --> Login --> Checkout
				return isSitelessJetpackCheckout
					? 'jetpack_siteless_checkout_coming_from_login'
					: 'jetpack_site_only_checkout_coming_from_login';
			}
			return isSitelessJetpackCheckout ? 'jetpack_siteless_checkout' : 'jetpack_site_only_checkout';
		}

		if ( checkoutType === 'akismet' ) {
			// TODO: do we need to handle checking out with a site slug but without a logged in user?
			return 'akismet_siteless_checkout';
		}

		if ( isLoggedOutCart ) {
			return 'wpcom_registrationless';
		}
		return isJetpackNotAtomic ? 'jetpack_checkout' : 'wpcom_checkout';
	}, [
		hasJetpackSiteSlug,
		checkoutType,
		isJetpackNotAtomic,
		isLoggedOutCart,
		isUserComingFromLoginForm,
	] );
}
