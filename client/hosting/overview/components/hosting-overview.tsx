import { translate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import ActiveDomainsCard from 'calypso/hosting/overview/components/active-domains-card';
import PlanCard from 'calypso/hosting/overview/components/plan-card';
import QuickActionsCard from 'calypso/hosting/overview/components/quick-actions-card';
import SiteBackupCard from 'calypso/hosting/overview/components/site-backup-card';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { isNotAtomicJetpack, isMigrationInProgress } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import MigrationOverview from './migration-overview';
import SupportCard from './support-card';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );

	if ( site ) {
		if ( isMigrationInProgress( site ) ) {
			return <MigrationOverview site={ site } />;
		}
	}

	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const subtitle = isJetpackNotAtomic
		? translate( 'Get a quick glance at your plans and upgrades.' )
		: translate( 'Get a quick glance at your plans, storage, and domains.' );

	return (
		<div className="hosting-overview">
			<PageViewTracker path="/overview/:site" title="Site Overview" />
			<NavigationHeader
				className="hosting-overview__navigation-header"
				title={ translate( 'Overview' ) }
				subtitle={ subtitle }
			/>
			<PlanCard />
			<QuickActionsCard />
			<SiteBackupCard />
			<SupportCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
