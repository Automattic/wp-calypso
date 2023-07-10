import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import InvoicesDashboard from 'calypso/jetpack-cloud/sections/partner-portal/primary/invoices-dashboard';

export default function AgencyInvoices() {
	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<InvoicesDashboard />
		</>
	);
}
