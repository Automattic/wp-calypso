import QueryJetpackPartnerPortalPartner from 'calypso/components/data/query-jetpack-partner-portal-partner';
import PaymentMethodList from 'calypso/jetpack-cloud/sections/partner-portal/primary/payment-method-list';

export default function AgencyPaymentMethods() {
	return (
		<>
			<QueryJetpackPartnerPortalPartner />
			<PaymentMethodList />
		</>
	);
}
