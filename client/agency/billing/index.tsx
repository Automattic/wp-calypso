import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import BillingDashboard from 'calypso/jetpack-cloud/sections/partner-portal/primary/billing-dashboard';

export default function AgencyBilling() {
	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<BillingDashboard />
		</>
	);
}
