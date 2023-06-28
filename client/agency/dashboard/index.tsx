import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import DashboardOverview from 'calypso/jetpack-cloud/sections/agency-dashboard/dashboard-overview';

import './style.scss';

export default function AgencyDashboard( props ) {
	const { search, currentPage, filter, sort } = props;

	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<DashboardOverview
				search={ search }
				currentPage={ currentPage }
				filter={ filter }
				sort={ sort }
			/>
		</>
	);
}
