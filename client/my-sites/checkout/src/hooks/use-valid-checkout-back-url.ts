import config from '@automattic/calypso-config';
import { isAllowedRedirectUrl } from '@automattic/calypso-url';
import { getLanguageSlugs } from '@automattic/i18n-utils';
import { useMemo } from 'react';
import { useSelector } from 'calypso/state';
import getInitialQueryArguments from 'calypso/state/selectors/get-initial-query-arguments';
import { getSiteId, isCommerceGardenSite, isJetpackSite } from 'calypso/state/sites/selectors';

const getAllowedHosts = ( siteSlug?: string ): string[] => {
	const hostname = config< string >( 'hostname' );
	const basicHosts: string[] = [
		'akismet.com',
		'jetpack.com',
		'jetpack.cloud.localhost',
		'cloud.jetpack.com',
		...( hostname ? [ hostname ] : [] ),
		...( siteSlug ? [ siteSlug.includes( '::' ) ? siteSlug.split( '::' )[ 0 ] : siteSlug ] : [] ),
	];

	const languageSpecificJetpackHosts = getLanguageSlugs().map(
		( lang: string ) => `${ lang }.jetpack.com`
	);

	return basicHosts.concat( languageSpecificJetpackHosts );
};

const useValidCheckoutBackUrl = (
	siteSlug: string | undefined,
	siteId?: number,
	queryArgName = 'checkoutBackUrl'
): string | undefined => {
	const queryArgs = useSelector( getInitialQueryArguments ) ?? {};
	const backUrl = queryArgs[ queryArgName ] as string | undefined;
	const selectedSiteId = useSelector(
		( state ) => siteId ?? getSiteId( state, siteSlug as string | null )
	);
	const jetpackSite = useSelector( ( state ) =>
		isJetpackSite( state, selectedSiteId, { treatAtomicAsJetpackSite: false } )
	);
	const isCommerce = useSelector( ( state ) =>
		selectedSiteId ? isCommerceGardenSite( state, selectedSiteId ) : false
	);

	return useMemo( () => {
		if ( ! backUrl ) {
			if ( queryArgName !== 'checkoutBackUrl' ) {
				return undefined;
			}
			// For akismet specific checkout, if navigated with direct link
			// We shouldn't be navigated to `start\domain` but to `akismet\plans`
			const isAkismetCheckout = window.location.pathname.startsWith( '/checkout/akismet' );
			if ( ! siteSlug && isAkismetCheckout ) {
				return 'https://akismet.com/pricing';
			}
			// For Jetpack specific checkout, if navigated with direct link
			// We should redirect to the jetpack pricing page
			if ( jetpackSite && ! isCommerce ) {
				return 'https://cloud.jetpack.com/pricing/' + ( siteSlug || '' );
			}
			return undefined;
		}

		const allowedHosts = getAllowedHosts( siteSlug );

		if ( isAllowedRedirectUrl( backUrl, allowedHosts ) ) {
			return backUrl;
		}

		return undefined;
	}, [ backUrl, queryArgName, isCommerce, jetpackSite, siteSlug ] );
};

export default useValidCheckoutBackUrl;
