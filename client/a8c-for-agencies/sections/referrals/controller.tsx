import { type Callback } from '@automattic/calypso-router';
import MainSidebar from '../../components/sidebar-menu/main';
import ReferralsBankDetails from './primary/bank-details';
import CommissionOverview from './primary/commission-overview';
import ReferralsOverview from './primary/referrals-overview';

export const referralsContext: Callback = ( context, next ) => {
	context.primary = <ReferralsOverview />;
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

export const referralsBankDetailsContext: Callback = ( context, next ) => {
	context.primary = <ReferralsBankDetails />;
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};

export const referralsCommissionOverviewContext: Callback = ( context, next ) => {
	context.primary = <CommissionOverview />;
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
