import { type Callback } from '@automattic/calypso-router';
import ReferralsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/referrals';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MainSidebar from '../../components/sidebar-menu/main';
import ReferralsBankDetails from './primary/bank-details';
import CommissionOverview from './primary/commission-overview';
import ReferralsOverview from './primary/referrals-overview';

export const referralsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals" path={ context.path } />
			<ReferralsOverview />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

export const referralsBankDetailsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Add bank details" path={ context.path } />
			<ReferralsBankDetails />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

export const referralsCommissionOverviewContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Commission details and terms" path={ context.path } />
			<CommissionOverview />
		</>
	);
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

export const referralsDashboardContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Dashboard" path={ context.path } />
			<div>Dashboard</div>
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};

export const referralsPaymentSettingsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Payment Settings" path={ context.path } />
			<div>Payment Settings</div>
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};

export const referralsFAQContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > FAQ" path={ context.path } />
			<div>FAQ</div>
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};
