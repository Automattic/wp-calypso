import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type SiteIdOrSlug = number | string | null;

export function useSiteGlobalStylesOnPersonal( siteIdOrSlug: SiteIdOrSlug = null ): boolean {
	const selectedSiteId = useSelector( getSelectedSiteId );

	// Determine the site ID, handling cases where the site hasn't been created yet.
	const siteId = useSelector( ( state ) => {
		const resolvedSiteId = siteIdOrSlug ?? selectedSiteId;
		if ( ! resolvedSiteId ) {
			return null;
		}

		const site = getSite( state, resolvedSiteId );
		return site?.ID ?? null;
	} );

	const { globalStylesInPersonalPlan } = useSiteGlobalStylesStatus( siteId );

	// Return true if global styles are enabled in the Personal Plan through feature flag or experiment.
	const isGlobalStylesOnPersonalEnabled =
		globalStylesInPersonalPlan || isEnabled( 'global-styles/on-personal-plan' );

	if ( typeof window !== 'undefined' ) {
		( window as any ).isGlobalStylesOnPersonal = isGlobalStylesOnPersonalEnabled;
	}

	return isGlobalStylesOnPersonalEnabled;
}
