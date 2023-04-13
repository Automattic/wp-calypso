import { getLanguageSlugs } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { resemblesUrl } from 'calypso/lib/url';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';

const getAllowedHosts = ( siteSlug?: string ) => {
	const basicHosts = [
		'akismet.com',
		'jetpack.com',
		'jetpack.cloud.localhost',
		'cloud.jetpack.com',
		...( ( siteSlug && [ siteSlug ] ) || [] ),
	];

	const languageSpecificJetpackHosts = getLanguageSlugs().map(
		( lang: string ) => `${ lang }.jetpack.com`
	);

	return basicHosts.concat( languageSpecificJetpackHosts );
};

const useValidCheckoutBackUrl = ( siteSlug: string | undefined ): string | undefined => {
	const { checkoutBackUrl } = useSelector( getInitialQueryArguments ) ?? {};

	return useMemo( () => {
		if ( ! checkoutBackUrl ) {
			// For akismet specific checkout, if navigated with direct link
			// We shouldn't be navigated to `start\domain` but to `akismet\plans`
			const isAkismetCheckout = window.location.pathname.startsWith( '/checkout/akismet' );
			if ( ! siteSlug && isAkismetCheckout ) {
				return 'https://akismet.com/pricing';
			}
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
