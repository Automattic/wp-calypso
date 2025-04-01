import WooPaymentsConsolidatedViews from './consolidated-views';
import SitesWithWooPayments from './sites-with-woopayments';

import './style.scss';

const WooPaymentsDashboardContent = () => {
	return (
		<>
			<WooPaymentsConsolidatedViews />
			<SitesWithWooPayments />
		</>
	);
};

export default WooPaymentsDashboardContent;
