import { type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
import ReferralsSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/referrals';
import ReferralsBankDetails from './primary/bank-details';
import CommissionOverview from './primary/commission-overview';
import ReferralsOverview from './primary/referrals-overview';

export const referralsDashboardContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Dashboard" path={ context.path } />
			<ReferralsOverview />
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};

export const referralsPaymentSettingsContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > Payment Settings" path={ context.path } />
			<ReferralsBankDetails />
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};

export const referralsFAQContext: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker title="Referrals > FAQ" path={ context.path } />
			<CommissionOverview />
		</>
	);
	context.secondary = <ReferralsSidebar path={ context.path } />;
	next();
};
