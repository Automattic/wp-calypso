import { type Callback } from '@automattic/calypso-router';
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
