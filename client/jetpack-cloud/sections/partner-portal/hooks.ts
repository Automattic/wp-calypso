/**
 * External dependencies
 */
import { useEffect } from 'react';
import page from 'page';
import { getQueryArg } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { ensurePartnerPortalReturnUrl } from 'calypso/jetpack-cloud/sections/partner-portal/utils';

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
