import { type Callback, type Context } from '@automattic/calypso-router';
import Overview from 'calypso/jetpack-cloud/sections/overview/primary/overview';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';

const setSidebar = ( context: Context ): void => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
};

export const overviewContext: Callback = ( context, next ) => {
	setSidebar( context );
	context.primary = <Overview />;
	next();
};
