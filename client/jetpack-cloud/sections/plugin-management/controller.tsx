import page, { type Callback, type Context } from '@automattic/calypso-router';
import JetpackManageSidebar from 'calypso/jetpack-cloud/sections/sidebar-navigation/jetpack-manage';
import { isAgencyUser } from 'calypso/state/partner-portal/partner/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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
		// `/plugins/manage/:site` selects a site and nothing downstream clears it, so the
		// multi-site views would otherwise stay scoped to whichever site was visited last.
		if ( getSelectedSiteId( context.store.getState() ) ) {
			context.store.dispatch( setSelectedSiteId( null ) );
		}
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
