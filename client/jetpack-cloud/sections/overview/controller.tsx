import { type Callback, type Context } from '@automattic/calypso-router';
import ContentSidebar from 'calypso/jetpack-cloud/components/content-sidebar';
import Overview from 'calypso/jetpack-cloud/sections/overview/primary/overview';
import OverviewSidebar from 'calypso/jetpack-cloud/sections/overview/primary/sidebar';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';

const setSidebar = ( context: Context ): void => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
};

export const overviewContext: Callback = ( context, next ) => {
	setSidebar( context );
	context.primary = (
		<ContentSidebar mainContent={ <Overview /> } rightSidebar={ <OverviewSidebar /> } />
	);
	next();
};
