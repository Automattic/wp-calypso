import { Context, type Callback } from '@automattic/calypso-router';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import SitesSidebar from '../../components/sidebar-menu/sites';
import SitesDashboard from './sites-dashboard';
import { SitesDashboardProvider } from './sites-dashboard-provider';

function configureSitesContext( isFavorites: boolean, context: Context ) {
	const category = context.params.category;
	const siteUrl = context.params.siteUrl;
	const siteFeature = context.params.feature;
	const hideListingInitialState = !! siteUrl;

	const {
		s: search,
		page: contextPage,
		issue_types,
		sort_field,
		sort_direction,
		is_favorite,
	} = context.query;

	const filter = {
		issueTypes: issue_types?.split( ',' ),
		showOnlyFavorites: is_favorite === true || is_favorite === '',
	};
	const sort = {
		field: sort_field,
		direction: sort_direction,
	};
	const currentPage = parseInt( contextPage ) || 1;

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			siteFeatureInitialState={ siteFeature }
			hideListingInitialState={ hideListingInitialState }
			path={ context.path }
			search={ search }
			currentPage={ currentPage }
			filter={ filter }
			sort={ sort }
			showSitesDashboardV2={ true }
		>
			<SitesDashboard />
		</SitesDashboardProvider>
	);

	context.secondary = <SitesSidebar path={ context.path } />;

	// By definition, Sites Management does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );
}

export const sitesContext: Callback = ( context, next ) => {
	configureSitesContext( false, context );
	next();
};
