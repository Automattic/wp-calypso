import { isEnabled } from '@automattic/calypso-config';
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	siteLaunchStatusGroupValues,
} from '@automattic/sites';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import AsyncLoad from 'calypso/components/async-load';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MySitesNavigation from 'calypso/my-sites/navigation';
import SitesDashboardV2 from 'calypso/sites-dashboard-v2';
import { removeNotice } from 'calypso/state/notices/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { SitesDashboard } from './components/sites-dashboard';
import { type Callback, Context, Context as PageJSContext } from '@automattic/calypso-router';
import {
	A4A_SITES_DASHBOARD_DEFAULT_CATEGORY,
	A4A_SITES_DASHBOARD_DEFAULT_FEATURE,
	DEFAULT_SORT_DIRECTION,
	DEFAULT_SORT_FIELD,
} from 'calypso/a8c-for-agencies/sections/sites/constants';
import type { DashboardSortInterface } from 'calypso/jetpack-cloud/sections/agency-dashboard/sites-overview/types';
import { SitesDashboardProvider } from 'calypso/a8c-for-agencies/sections/sites/sites-dashboard-provider';
import SitesSidebar from 'calypso/a8c-for-agencies/components/sidebar-menu/sites';

const getStatusFilterValue = ( status?: string ) => {
	return siteLaunchStatusGroupValues.find( ( value ) => value === status );
};

const sitesDashboardGlobalStyles = css`
	body.is-group-sites-dashboard {
		background: var( --studio-gray-0 );

		.layout__content {
			// Add border around everything
			overflow: hidden;
			min-height: 100vh;
			padding: 16px 16px 16px calc( var( --sidebar-width-max ) );
		}

		.layout__secondary .global-sidebar {
			border: none;
		}
	}

	.main.sites-dashboard.sites-dashboard__layout:has( .dataviews-pagination ) {
		height: calc( 100vh - 32px );
	}

	// Update body margin to account for the sidebar width
	@media only screen and ( min-width: 782px ) {
		div.layout.is-global-sidebar-visible {
			.layout__primary main {
				background: var( --color-surface );
				border-radius: 8px;
				box-shadow: 0px 0px 17.4px 0px rgba( 0, 0, 0, 0.05 );
				height: calc( 100vh - 32px );
				overflow: auto;
			}
		}
	}

	@media only screen and ( max-width: 781px ) {
		div.layout.is-global-sidebar-visible {
			.layout__primary {
				overflow-x: auto;
			}
		}
	}
`;

export function sanitizeQueryParameters( context: PageJSContext, next: () => void ) {
	/**
	 * We need a base case because `page.replace` triggers a re-render for every middleware
	 * in the route.
	 */
	if ( context.query.status === undefined ) {
		context.query.status = DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE;
		return next();
	}

	const status = context.query.status.trim();

	if ( status === '' ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'status' ) );
		return;
	}

	const chosenStatus = getStatusFilterValue( status );

	if ( ! chosenStatus ) {
		context.page.replace( removeQueryArgs( context.canonicalPath, 'status' ) );
		return;
	}

	context.query.status = chosenStatus;
	next();
}

export function sitesDashboard( context: PageJSContext, next: () => void ) {
	context.secondary = <MySitesNavigation path={ context.path } />;

	const queryParams = {
		page: context.query.page ? parseInt( context.query.page ) : undefined,
		perPage: context.query[ 'per-page' ] ? parseInt( context.query[ 'per-page' ] ) : undefined,
		search: context.query.search,
		status: context.query.status,
		newSiteID: parseInt( context.query[ 'new-site' ] ) || undefined,
	};

	context.primary = (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
			{ isEnabled( 'layout/dotcom-nav-redesign-v2' ) ? (
				// Sites Dashboard V2 - Dotcom Nav Redesign V2
				<SitesDashboardV2 queryParams={ queryParams } />
			) : (
				<SitesDashboard queryParams={ queryParams } />
			) }
		</>
	);

	if ( isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
		// By definition, Sites Management does not select any one specific site
		context.store.dispatch( setAllSitesSelected() );
	}
	next();
}

export function maybeRemoveCheckoutSuccessNotice( context: PageJSContext, next: () => void ) {
	if ( context.query[ 'new-site' ] ) {
		// `?new-site` shows a site creation notice and we don't want to show a double notice,
		// so hide the checkout success notice if it's there.
		context.store.dispatch( removeNotice( 'checkout-thank-you-success' ) );
	}
	next();
}

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
	} = context.query;

	const sort: DashboardSortInterface = {
		field: sort_field || DEFAULT_SORT_FIELD,
		direction: sort_direction || DEFAULT_SORT_DIRECTION,
	};
	const currentPage = parseInt( contextPage ) || 1;

	// TODO - not sure this is needed if we have this data in the provider
	const queryParams = {
		page: context.query.page ? parseInt( context.query.page ) : undefined,
		perPage: context.query[ 'per-page' ] ? parseInt( context.query[ 'per-page' ] ) : undefined,
		search: context.query.search,
		status: context.query.status,
		newSiteID: parseInt( context.query[ 'new-site' ] ) || undefined,
	};

	context.primary = (
		<SitesDashboardProvider
			categoryInitialState={ category }
			siteUrlInitialState={ siteUrl }
			siteFeatureInitialState={ siteFeature }
			hideListingInitialState={ hideListingInitialState }
			showOnlyFavoritesInitialState={
				is_favorite === '' || is_favorite === '1' || is_favorite === 'true'
			}
			path={ context.path }
			searchQuery={ search }
			currentPage={ currentPage }
			issueTypes={ issue_types }
			sort={ sort }
			{ ...( context.featurePreview ? { featurePreview: context.featurePreview } : {} ) }
		>
			<SitesDashboardV2 queryParams={ queryParams } />
		</SitesDashboardProvider>
	);

	context.secondary = <MySitesNavigation path={ context.path } />;
}

export const sitesContext: Callback = ( context: Context, next ) => {
	configureSitesContext( context );
	next();
};
