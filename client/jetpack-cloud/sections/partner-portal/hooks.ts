import { getQueryArg } from '@wordpress/url';
import page from 'page';
import { useEffect } from 'react';
import { useQuery } from 'react-query';
import { ensurePartnerPortalReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
/**
 * Redirect to the partner portal or a present "return" GET parameter given a certain condition.
 *
 * @param {boolean} redirect Whether to execute the redirect.
 * @returns {void}
 */
export function useReturnUrl( redirect: boolean ): void {
	useEffect( () => {
		if ( redirect ) {
			const returnQuery = getQueryArg( window.location.href, 'return' ) as string;
			const returnUrl = ensurePartnerPortalReturnUrl( returnQuery );

			page.redirect( returnUrl );
		}
	}, [ redirect ] );
}

/**
 * Returns the recent payment methods from the Jetpack Stripe account.
 *
 */
export function useRecentPaymentMethodsQuery() {
	return useQuery( [ 'jetpack-cloud', 'partner-portal', 'recent-cards' ], () =>
		wpcomJpl.req.get( {
			apiNamespace: 'wpcom/v2',
			path: '/jetpack-licensing/stripe/payment-methods',
		} )
	);
}
