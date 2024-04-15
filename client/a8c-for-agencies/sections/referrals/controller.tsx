import { type Callback } from '@automattic/calypso-router';
import MainSidebar from '../../components/sidebar-menu/main';

export const referralsContext: Callback = ( context, next ) => {
	context.primary = 'Referrals!';
	context.secondary = <MainSidebar path={ context.path } />;
	next();
};
