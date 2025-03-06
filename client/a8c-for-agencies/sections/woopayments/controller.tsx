import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import WooPaymentsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/woopayments';
import ReferralsBankDetails from '../referrals/primary/bank-details';
import WooPaymentsDashboard from './primary/woopayments-dashboard';
import WooPaymentsSiteSetup from './primary/woopayments-site-setup';

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
			<ReferralsBankDetails type="woopayments" />
		</>
	);
	context.secondary = <WooPaymentsSidebar path={ context.path } />;
	next();
};

export const woopaymentsSiteSetupContext: Callback = ( context, next ) => {
	const siteId = context.query.site_id;

	context.primary = (
		<>
			<PageViewTracker title="WooPayments > Site Setup" path={ context.path } />
			<WooPaymentsSiteSetup siteId={ siteId } />
		</>
	);
	context.secondary = <WooPaymentsSidebar path={ context.path } />;
	next();
};
