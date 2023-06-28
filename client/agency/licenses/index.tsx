import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import Licenses from 'calypso/jetpack-cloud/sections/partner-portal/primary/licenses';

export default function AgencyLicenses( props ) {
	const { filter, search, currentPage, sortDirection, sortField } = props;
	return (
		<>
			<QueryJetpackPartnerPortalPartner />

			<Licenses
				filter={ filter }
				search={ search || '' }
				currentPage={ currentPage }
				sortDirection={ sortDirection }
				sortField={ sortField }
			/>
		</>
	);
}
