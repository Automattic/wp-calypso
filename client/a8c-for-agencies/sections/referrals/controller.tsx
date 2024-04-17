import { type Callback } from '@automattic/calypso-router';
import MainSidebar from '../../components/sidebar-menu/main';
import ReferralsOverview from './primary/referrals-overview';

export const referralsContext: Callback = ( context, next ) => {
	context.primary = <ReferralsOverview />;
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
