import { FC } from 'react';
import ActiveDomainsCard from 'calypso/hosting-overview/components/active-domains-card';
import PlanCard from 'calypso/hosting-overview/components/plan-card';
import QuickActionsCard from 'calypso/hosting-overview/components/quick-actions-card';
import './style.scss';

const HostingOverview: FC = () => {
	return (
		<>
			<div className="hosting-overview__top-cards-wrapper">
				<PlanCard />
				<QuickActionsCard />
			</div>
			<ActiveDomainsCard />
		</>
	);
};

export default HostingOverview;
