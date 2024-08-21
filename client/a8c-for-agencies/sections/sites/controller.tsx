import { Context, type Callback } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/a8c-for-agencies/components/a4a-page-view-tracker';
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
import type { DashboardSortInterface } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';

function configureSitesContext( context: Context ) {
	const category = context.params.category || A4A_SITES_DASHBOARD_DEFAULT_CATEGORY;
	const siteUrl = context.params.siteUrl;
	const siteFeature = context.params.feature || A4A_SITES_DASHBOARD_DEFAULT_FEATURE;
	const hideListingInitialState = !! siteUrl;

	const {
		s: search,
		page: contextPage,
		issue_types,
		sort_field,
		sort_direction,
		is_favorite,
		is_development,
	} = context.query;

	const sort: DashboardSortInterface = {
		field: sort_field || DEFAULT_SORT_FIELD,
		direction: sort_direction || DEFAULT_SORT_DIRECTION,
	};
	const currentPage = parseInt( contextPage ) || 1;

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			siteFeatureInitialState={ siteFeature }
			hideListingInitialState={ hideListingInitialState }
			showOnlyFavoritesInitialState={
				is_favorite === '' || is_favorite === '1' || is_favorite === 'true'
			}
			showOnlyDevelopmentInitialState={
				is_development === '' || is_development === '1' || is_development === 'true'
			}
			path={ context.path }
			searchQuery={ search }
			currentPage={ currentPage }
			issueTypes={ issue_types }
			sort={ sort }
			{ ...( context.featurePreview ? { featurePreview: context.featurePreview } : {} ) }
		>
			<PageViewTracker
				title="Sites"
				path={ context.path }
				properties={ {
					category: context.params.category,
					siteUrl: context.params.siteUrl,
					feature: context.params.feature,
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
		is_development,
	} = context.query;
	const state = context.store.getState();
	const agency = getActiveAgency( state );

	context.dashboardSitesQuery = {
		isPartnerOAuthTokenLoaded: false,
		searchQuery: search || '',
		currentPage: contextPage || 1,
		sort: {
			field: sort_field || '',
			direction: sort_direction || '',
		},
		perPage: 100,
		agencyId: agency?.id,
		filter: {
			issueTypes: [ issue_types ],
			showOnlyFavorites: !! is_favorite,
			showOnlyDevSites: !! is_development,
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
	const { license_key } = context.query;
	context.primary = (
		<>
			<PageViewTracker title="Sites > Needs Setup" path={ context.path } />
			<NeedSetup licenseKey={ license_key } />
		</>
	);

	next();
};
