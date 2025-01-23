import page, { type Callback, type Context } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { A4A_PLUGINS_LINK } from '../../components/sidebar-menu/lib/constants';
import MainSidebar from '../../components/sidebar-menu/main';

// Reset selected site id for multi-site view since it is never reset
// and the plugins component behaves differently when there
// is a selected site which is incorrect for multi-site view
const resetSite = ( context: Context ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( siteId ) {
		context.store.dispatch( setSelectedSiteId( null ) );
	}
};

export const pluginsContext: Callback = ( context ) => {
	const { slug } = context.params;
	const redirectPath = slug
		? `${ A4A_PLUGINS_LINK }/manage/sites/${ slug }`
		: `${ A4A_PLUGINS_LINK }/manage/sites`;

	page.redirect( redirectPath );
};

export const pluginManagementContext: Callback = ( context, next ) => {
	resetSite( context );
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Plugins" path={ context.path } />
		</>
	);
	next();
};

export const pluginDetailsContext: Callback = ( context, next ) => {
	resetSite( context );
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Plugins" path={ context.path } />
		</>
	);
	next();
};
