import { useA8CForAgenciesSitesBanner } from './sites-dashboard-banners/use-a8c-for-agencies-sites-banner';
import { useMigrationPendingSitesBanner } from './sites-dashboard-banners/use-migration-pending-sites-banner';
import { useRestoreSitesBanner } from './sites-dashboard-banners/use-restore-sites-reminder-banner';
import type { Status } from '@automattic/sites/src/use-sites-list-grouping';

type SitesDashboardBannersManagerProps = {
	sitesStatuses: Status[];
	sitesCount: number;
};

const SitesDashboardBannersManager = ( {
	sitesStatuses,
	sitesCount,
}: SitesDashboardBannersManagerProps ) => {
	// Define banners in priority order
	const banners = [
		useRestoreSitesBanner(),
		useMigrationPendingSitesBanner( { sitesStatuses } ),
		useA8CForAgenciesSitesBanner( { sitesCount } ),
	];

	// Return the first banner that should show
	for ( const banner of banners ) {
		if ( banner.shouldShow() ) {
			return <div className="sites-banner-container">{ banner.render() }</div>;
		}
	}

	return null;
};

export default SitesDashboardBannersManager;
