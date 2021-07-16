/**
 * External dependencies
 */
import { useMemo } from 'react';

interface Props {
	isJetpackCheckout: boolean;
	isJetpackNotAtomic: boolean;
	isLoggedOutCart?: boolean;
	isNoSiteCart?: boolean;
	isUserComingFromLoginForm?: boolean;
}

export default function useCheckoutFlowTrackKey( {
	isJetpackCheckout,
	isJetpackNotAtomic,
	isLoggedOutCart,
	isNoSiteCart,
	isUserComingFromLoginForm,
}: Props ): string {
	return useMemo( () => {
		const isSitelessJetpackCheckout = isJetpackCheckout && isNoSiteCart;
		if ( isSitelessJetpackCheckout ) {
			return 'jetpack_siteless_checkout';
		}

		if ( isLoggedOutCart ) {
			if ( isJetpackCheckout ) {
				return isUserComingFromLoginForm
					? 'jetpack_site_only_coming_from_login'
					: 'jetpack_site_only';
			}
			return 'wpcom_registrationless';
		}

		return isJetpackNotAtomic ? 'jetpack_checkout' : 'wpcom_checkout';
	}, [
		isJetpackCheckout,
		isJetpackNotAtomic,
		isLoggedOutCart,
		isNoSiteCart,
		isUserComingFromLoginForm,
	] );
}
