import { translate } from 'i18n-calypso';
import { FC } from 'react';
import NavigationHeader from 'calypso/components/navigation-header';
import ActiveDomainsCard from 'calypso/hosting-overview/components/active-domains-card';
import PlanCard from 'calypso/hosting-overview/components/plan-card';
import QuickActionsCard from 'calypso/hosting-overview/components/quick-actions-card';

import './style.scss';

const HostingOverview: FC = () => {
	return (
		<div className="hosting-overview">
			<NavigationHeader
				className="hosting-overview__navigation-header"
				title={ translate( 'Overview' ) }
				subtitle={ translate( 'Get a quick glance at your plans, storage, and domains.' ) }
			/>
			<PlanCard />
			<QuickActionsCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
