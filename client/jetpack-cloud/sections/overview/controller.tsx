import page, { type Callback, type Context } from '@automattic/calypso-router';
import ContentSidebar from 'calypso/jetpack-cloud/components/content-sidebar';
import Overview from 'calypso/jetpack-cloud/sections/overview/primary/overview';
import OverviewSidebar from 'calypso/jetpack-cloud/sections/overview/primary/sidebar';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';

const setSidebar = ( context: Context ): void => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
};

export const requireAccessContext: Callback = ( context, next ) => {
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	if ( ! isAgency ) {
		return page.redirect( '/' );
	}

	next();
};

export const overviewContext: Callback = ( context, next ) => {
	setSidebar( context );
	context.primary = (
		<ContentSidebar mainContent={ <Overview /> } rightSidebar={ <OverviewSidebar /> } />
	);
	next();
};
