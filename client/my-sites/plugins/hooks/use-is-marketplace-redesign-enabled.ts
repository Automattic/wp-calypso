import { isEnabled } from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { hasHostingDashboardOptIn } from 'calypso/state/sites/selectors/has-hosting-dashboard-opt-in';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Hook to determine if the marketplace redesign feature should be applied.
 *
 * The marketplace redesign is shown when ALL of the following are true:
 * 1. The 'marketplace-redesign' feature flag is enabled
 * 2. No site is selected
 * 3. Either the user is logged out OR the user has opted into the dashboard/v2 (hosting dashboard opt-in)
 *
 * This ensures the redesign is applied for:
 * - Logged-out users (chromeless experience)
 * - Logged-in users with dashboard opt-in but no site selected (MSD context)
 *
 * And is NOT applied for:
 * - Any user with a site selected (Calypso admin context)
 * - Logged-in users without dashboard opt-in and no site selected (v1 dashboard)
 * @returns {boolean} Whether the marketplace redesign should be applied.
 */
export function useIsMarketplaceRedesignEnabled(): boolean {
	const siteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );
	const hostingDashboardOptIn = useSelector( hasHostingDashboardOptIn );

	// Never show redesign when a site is selected
	if ( siteId ) {
		return false;
	}

	// Show redesign for logged-out users or logged-in users with dashboard opt-in
	return isEnabled( 'marketplace-redesign' ) && ( ! isLoggedIn || hostingDashboardOptIn );
}
