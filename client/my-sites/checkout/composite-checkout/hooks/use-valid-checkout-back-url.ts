import { getLanguageSlugs } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { resemblesUrl } from 'calypso/lib/url';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

const getAllowedHosts = ( siteSlug: string ) => {
	const basicHosts = [ 'jetpack.com', 'jetpack.cloud.localhost', 'cloud.jetpack.com', siteSlug ];

	const languageSpecificJetpackHosts = getLanguageSlugs().map(
		( lang: string ) => `${ lang }.jetpack.com`
	);

	return basicHosts.concat( languageSpecificJetpackHosts );
};

const useValidCheckoutBackUrl = ( siteSlug: string | undefined ): string | undefined => {
	const { checkoutBackUrl } = useSelector( getInitialQueryArguments ) ?? {};

	return useMemo( () => {
		if ( ! siteSlug || ! checkoutBackUrl ) {
			return undefined;
		}

		const allowedHosts = getAllowedHosts( siteSlug );

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
