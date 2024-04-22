import { FC } from 'react';
import ActiveDomainsCard from 'calypso/hosting/components/active-domains-card';
import PlanCard from 'calypso/hosting/components/plan-card';
import QuickActionsCard from 'calypso/hosting/components/quick-actions-card';
import './style.scss';

const HostingOverview: FC = () => {
	return (
		<div className="hosting-overview">
			<PlanCard />
			<QuickActionsCard />
			<ActiveDomainsCard />
		</div>
	);
};

export default HostingOverview;
