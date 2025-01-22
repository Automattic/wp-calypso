import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';

type SiteIdOrSlug = number | string | null;

export function useSiteGlobalStylesOnPersonal( siteIdOrSlug: SiteIdOrSlug = null ): boolean {
	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus( siteIdOrSlug );

	// Return true if global styles are enabled in the Personal Plan through feature flag or experiment.
	const isGlobalStylesOnPersonalEnabled =
		globalStylesInPersonalPlan || isEnabled( 'global-styles/on-personal-plan' );

	useEffect( () => {
		if ( typeof window !== 'undefined' ) {
			( window as any ).isGlobalStylesOnPersonal = isGlobalStylesOnPersonalEnabled;
		}
	}, [ isGlobalStylesOnPersonalEnabled ] );

	return isGlobalStylesOnPersonalEnabled;
}
