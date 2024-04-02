import config from '@automattic/calypso-config';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';

export default function useSiteComplusoryPlanSelectionQualifiedCheck( siteId: number | null ) {
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;
	const isNewSite =
		siteCreatedTimeStamp && new Date( siteCreatedTimeStamp ) > new Date( '2024-01-31' ); // Targeting new sites
	// TODO: remove `isOdyssey` check to release to Odyssey Stats.
	const isExistingSampleSite = siteId && siteId % 100 < 1 && ! isOdysseyStats; // Targeting 1% of existing sites

	return {
		isNewSite,
		isExistingSampleSite,
		isQualified: isNewSite || isExistingSampleSite,
	};
}
