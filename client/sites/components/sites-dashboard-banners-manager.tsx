import { useDashboardOptInBanner } from './sites-dashboard-banners/use-dashboard-opt-in-banner';
import {
	useMigrationPendingSitesBanner,
	type SiteStatus,
} from './sites-dashboard-banners/use-migration-pending-sites-banner';
import { useRestoreSitesBanner } from './sites-dashboard-banners/use-restore-sites-reminder-banner';

type SitesDashboardBannersManagerProps = {
	sitesStatuses: SiteStatus[];
};

const SitesDashboardBannersManager = ( { sitesStatuses }: SitesDashboardBannersManagerProps ) => {
	// Define banners in priority order
	const banners = [
		useRestoreSitesBanner(),
		useMigrationPendingSitesBanner( { sitesStatuses } ),
		useDashboardOptInBanner(),
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
