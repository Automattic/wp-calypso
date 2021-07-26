/**
 * External dependencies
 */
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { resemblesUrl } from 'calypso/lib/url';

const useValidCheckoutBackUrl = ( siteSlug: string | undefined ): string | undefined => {
	const { checkoutBackUrl } = useSelector( getInitialQueryArguments ) ?? {};

	return useMemo( () => {
		if ( ! siteSlug || ! checkoutBackUrl ) {
			return undefined;
		}

		const allowedHosts = [ 'jetpack.cloud.localhost', 'cloud.jetpack.com', siteSlug ];

		let parsedUrl;
		try {
			parsedUrl = new URL( checkoutBackUrl );
		} catch {
			return undefined;
		}
		const { hostname } = parsedUrl;
		if ( resemblesUrl( checkoutBackUrl ) && hostname && allowedHosts.includes( hostname ) ) {
			return checkoutBackUrl;
		}

		return undefined;
	}, [ siteSlug, checkoutBackUrl ] );
};

export default useValidCheckoutBackUrl;
