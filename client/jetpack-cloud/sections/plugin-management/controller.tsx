import page, { type Callback, type Context } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import Header from '../agency-dashboard/header';
import PluginsOverview from './plugins-overview';

const redirectIfHasNoAccess = ( context: Context ) => {
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );

	if ( ! isAgency ) {
		page.redirect( '/' );
		return;
	}
};

const setSidebar = ( context: Context ): void => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
};

export const pluginManagementContext: Callback = ( context, next ) => {
	redirectIfHasNoAccess( context );
	const { site } = context.params;
	context.header = <Header />;
	// Set secondary context only on multi-site view
	if ( ! site ) {
		setSidebar( context );
	}
	next();
};

export const pluginDetailsContext: Callback = ( context, next ) => {
	redirectIfHasNoAccess( context );
	const { plugin, site } = context.params;
	context.header = <Header />;
	// Set secondary context only on multi-site view
	if ( ! site ) {
		setSidebar( context );
	}
	context.primary = <PluginsOverview pluginSlug={ plugin } site={ site } path={ context.path } />;
	next();
};
