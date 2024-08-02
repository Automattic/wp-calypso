import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import ActiveDomainsCard from 'calypso/hosting/overview/components/active-domains-card';
import PlanCard from 'calypso/hosting/overview/components/plan-card';
import QuickActionsCard from 'calypso/hosting/overview/components/quick-actions-card';
import SiteBackupCard from 'calypso/hosting/overview/components/site-backup-card';
import SupportCard from 'calypso/my-sites/hosting/support-card';
import { isNotAtomicJetpack } from 'calypso/sites-dashboard/utils';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const HostingOverview: FC = () => {
	const site = useSelector( getSelectedSite );
	const isJetpackNotAtomic = site && isNotAtomicJetpack( site );
	const subtitle = isJetpackNotAtomic
		? translate( 'Get a quick glance at your plans and upgrades.' )
		: translate( 'Get a quick glance at your plans, storage, and domains.' );

	return (
		<div className="hosting-overview">
			<p
				className="hosting-overview-refinement-flag-test"
				style={ {
					display: config.isEnabled( 'hosting-overview-refinements' ) ? 'auto' : 'none',
					gridArea: '1 / 2',
				} }
			>
				Hello World
			</p>
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
