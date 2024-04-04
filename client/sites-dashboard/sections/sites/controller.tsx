import { Context, type Callback } from '@automattic/calypso-router';
import MySitesNavigation from 'calypso/my-sites/navigation';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { SITES_DASHBOARD_DEFAULT_CATEGORY } from './constants';
import SitesDashboard from './sites-dashboard';
import { SitesDashboardProvider } from './sites-dashboard-provider';

function configureSitesContext( context: Context ) {
	const category = context.params.category || SITES_DASHBOARD_DEFAULT_CATEGORY;
	const siteUrl = context.params.siteUrl;

	const {
		s: search,
		page: contextPage,
		issue_types,
		sort_field,
		sort_direction,
	} = context.query;

	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const currentPage = parseInt( contextPage ) || 1;

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			path={ context.path }
			searchQuery={ search }
			currentPage={ currentPage }
			issueTypes={ issue_types }
			sort={ sort }
			showSitesDashboardV2={ true }
		>
			<SitesDashboard />
		</SitesDashboardProvider>
	);

	context.secondary = <MySitesNavigation path={ context.path } />;

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );
}

export const sitesContext: Callback = ( context, next ) => {
	configureSitesContext( context );
	next();
};
