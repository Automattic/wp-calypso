import { type Callback, type Context } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import MainSidebar from '../../components/sidebar-menu/main';
import ThemesDashboard from './primary/themes-dashboard';

// Reset selected site id for multi-site view since it is never reset
// and the themes aggregation behaves differently when there
// is a selected site which is incorrect for multi-site view
const resetSite = ( context: Context ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( siteId ) {
		context.store.dispatch( setSelectedSiteId( null ) );
	}
};

export const themesContext: Callback = ( context, next ) => {
	resetSite( context );
	context.secondary = <MainSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Themes" path={ context.path } />
			<ThemesDashboard />
		</>
	);
	next();
};
