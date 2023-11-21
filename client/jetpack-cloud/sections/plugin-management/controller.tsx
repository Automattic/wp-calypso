import config from '@automattic/calypso-config';
import page, { type Callback, type Context } from 'page';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import Header from '../agency-dashboard/header';
import PluginsOverview from './plugins-overview';

const redirectIfHasNoAccess = ( context: Context ) => {
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );

	if ( ! isAgency || ! isAgencyEnabled || ! isPluginManagementEnabled ) {
		page.redirect( '/' );
		return;
	}
};

const setSidebar = ( context: Context ): void => {
	context.secondary = <JetpackManageSidebar path={ context.path } />;
};

export const pluginManagementContext: Callback = ( context, next ) => {
	redirectIfHasNoAccess( context );
	const { filter = 'all', site } = context.params;
	const { s: search } = context.query;
	context.header = <Header />;
	// Set secondary context only on multi-site view
	if ( ! site ) {
		setSidebar( context );
	}
	context.primary = (
		<PluginsOverview
			filter={ filter === 'manage' ? 'all' : filter }
			search={ search }
			site={ site }
		/>
	);
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
