import config from '@automattic/calypso-config';
import page from 'page';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import Header from '../agency-dashboard/header';
import DashboardSidebar from '../agency-dashboard/sidebar';
import PluginsOverview from './plugins-overview';

export function pluginManagementContext( context: PageJS.Context, next: VoidFunction ): void {
	const state = context.store.getState();
	const isAgency = isAgencyUser( state );
	const isAgencyEnabled = config.isEnabled( 'jetpack/agency-dashboard' );
	const isPluginManagementEnabled = config.isEnabled( 'jetpack/plugin-management' );

	if ( ! isAgency || ! isAgencyEnabled || ! isPluginManagementEnabled ) {
		page.redirect( '/' );
		return;
	}

	const { filter = 'all', site } = context.params;
	const { s: search } = context.query;
	context.header = <Header />;
	// Set secondary context only on multi-site view
	if ( ! site ) {
		context.secondary = <DashboardSidebar path={ context.path } />;
	}
	context.primary = (
		<PluginsOverview
			filter={ filter === 'manage' ? 'all' : filter }
			search={ search }
			site={ site }
		/>
	);
	next();
}

export function pluginDetailsContext( context: PageJS.Context, next: VoidFunction ): void {
	const { plugin, site } = context.params;
	context.header = <Header />;
	// Set secondary context only on multi-site view
	if ( ! site ) {
		context.secondary = <DashboardSidebar path={ context.path } />;
	}
	context.primary = <PluginsOverview pluginSlug={ plugin } site={ site } path={ context.path } />;
	next();
}
