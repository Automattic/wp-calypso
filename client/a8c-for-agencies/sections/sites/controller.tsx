import { Context, type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import SitesSidebar from '../../components/sidebar-menu/sites';
import AddSitesFromWPCOM from './add-sites/add-sites-from-wpcom';
import {
	A4A_SITES_DASHBOARD_DEFAULT_CATEGORY,
	A4A_SITES_DASHBOARD_DEFAULT_FEATURE,
	DEFAULT_SORT_DIRECTION,
	DEFAULT_SORT_FIELD,
} from './constants';
import NeedSetup from './needs-setup-sites';
import SitesDashboard from './sites-dashboard';
import { SitesDashboardProvider } from './sites-dashboard-provider';

function configureSitesContext( context: Context ) {
	const category = context.params.category || A4A_SITES_DASHBOARD_DEFAULT_CATEGORY;
	const siteUrl = context.params.siteUrl;
	const siteFeature = context.params.feature || A4A_SITES_DASHBOARD_DEFAULT_FEATURE;
	const hideListingInitialState = !! siteUrl;

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			siteFeatureInitialState={ siteFeature }
			hideListingInitialState={ hideListingInitialState }
			showOnlyFavoritesInitialState={ context.dashboardSitesQuery?.showOnlyFavorites }
			path={ context.path }
			searchQuery={ context.dashboardSitesQuery.searchQuery }
			currentPage={ context.dashboardSitesQuery.currentPage }
			filters={ {
				status: context.dashboardSitesQuery.filter.issueTypes,
				siteTags: context.dashboardSitesQuery.filter.siteTags,
			} }
			sort={ context.dashboardSitesQuery.sort }
			{ ...( context.featurePreview ? { featurePreview: context.featurePreview } : {} ) }
		>
			<PageViewTracker
				title="Sites"
				path={ context.path }
				properties={ {
					category,
					siteUrl,
					feature: siteFeature,
				} }
			/>

			<SitesDashboard />
		</SitesDashboardProvider>
	);

	context.secondary = <SitesSidebar path={ context.path } />;
}

export const sitesContext: Callback = ( context: Context, next ) => {
	configureSitesContext( context );
	next();
};

export const dashboardSitesContext: Callback = ( context: Context, next ) => {
	const {
		s: search,
		page: contextPage,
		sort_field,
		sort_direction,
		issue_types,
		is_favorite,
		site_tags,
	} = context.query;
	const state = context.store.getState();
	const agency = getActiveAgency( state );

	context.dashboardSitesQuery = {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: search || '',
		currentPage: contextPage || 1,
		sort: {
			field: sort_field || DEFAULT_SORT_FIELD,
			direction: sort_direction || DEFAULT_SORT_DIRECTION,
		},
		perPage: 100,
		agencyId: agency?.id,
		filter: {
			issueTypes: issue_types,
			siteTags: site_tags,
			showOnlyFavorites: !! is_favorite,
		},
	};

	next();
};

export const addSitesContext: Callback = ( context: Context, next ) => {
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Add Sites > Add sites from WordPress.com" path={ context.path } />
			<AddSitesFromWPCOM dashboardSitesQuery={ context.dashboardSitesQuery } />
		</>
	);
	next();
};

export const needsSetupContext: Callback = ( context: Context, next ) => {
	context.secondary = <SitesSidebar path={ context.path } />;
	context.primary = (
		<>
			<PageViewTracker title="Sites > Needs Setup" path={ context.path } />
			<NeedSetup />
		</>
	);

	next();
};
