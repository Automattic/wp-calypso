import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import WooPaymentsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/woopayments';
import ReferralsBankDetails from '../referrals/primary/bank-details';
import WooPaymentsDashboard from './primary/woopayments-dashboard';

export const woopaymentsDashboardContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="WooPayments > Dashboard" path={ context.path } />
			<WooPaymentsDashboard />
		</>
	);
	context.secondary = <WooPaymentsSidebar path={ context.path } />;
	next();
};

export const woopaymentsPaymentSettingsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="WooPayments > Payment Settings" path={ context.path } />
			<ReferralsBankDetails isAutomatedReferral />
		</>
	);
	context.secondary = <WooPaymentsSidebar path={ context.path } />;
	next();
};
