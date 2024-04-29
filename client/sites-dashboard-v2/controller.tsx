import { isEnabled } from '@automattic/calypso-config';
import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	siteLaunchStatusGroupValues,
} from '@automattic/sites';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import AsyncLoad from 'calypso/components/async-load';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import SitesDashboardV2 from './sites-dashboard';
import type { Context, Context as PageJSContext } from '@automattic/calypso-router';

const getStatusFilterValue = ( status?: string ) => {
	return siteLaunchStatusGroupValues.find( ( value ) => value === status );
};

function getQueryParams( context: Context ) {
	return {
		page: context.query.page ? parseInt( context.query.page ) : undefined,
		perPage: context.query[ 'per-page' ] ? parseInt( context.query[ 'per-page' ] ) : undefined,
		search: context.query.search,
		status: context.query.status,
	};
}

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

export function sitesDashboard( context: Context, next: () => void ) {
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

		body.is-group-sites-dashboard.rtl .layout__content {
			padding: 16px calc( var( --sidebar-width-max ) ) 16px 16px;
		}

		.main.sites-dashboard.sites-dashboard__layout:has( .dataviews-pagination ) {
			height: calc( 100vh - 32px );
			padding-bottom: 0;
			box-shadow: none;
		}

		div.is-group-sites-dashboard:not( .has-no-masterbar ) {
			.main.sites-dashboard.sites-dashboard__layout:has( .dataviews-pagination ) {
				// Fix for scrollbars when global-sidebar is not visible because masterbar is visible
				height: calc( 100vh - 95px );
			}
		}

		// Update body margin to account for the sidebar width
		@media only screen and ( min-width: 782px ) {
			div.layout.is-global-sidebar-visible {
				.layout__primary > main {
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

	context.primary = (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
			<SitesDashboardV2 queryParams={ getQueryParams( context ) } />
		</>
	);

	// By definition, Sites Dashboard does not select any one specific site
	context.store.dispatch( setAllSitesSelected() );

	next();
}

export function siteDashboard( feature: string ) {
	return ( context: Context, next: () => void ) => {
		if ( ! isEnabled( 'layout/dotcom-nav-redesign-v2' ) ) {
			next();
			return;
		}

		const state = context.store.getState();

		context.primary = (
			<SitesDashboardV2
				selectedSite={ getSelectedSite( state ) }
				initialSiteFeature={ feature }
				selectedSiteFeaturePreview={ context.primary }
				queryParams={ getQueryParams( context ) }
			/>
		);
		next();
	};
}
