import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	siteLaunchStatusGroupValues,
} from '@automattic/sites';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import AsyncLoad from 'calypso/components/async-load';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MySitesNavigation from 'calypso/my-sites/navigation';
import { removeNotice } from 'calypso/state/notices/actions';
import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from '@automattic/calypso-router';

const getStatusFilterValue = ( status?: string ) => {
	return siteLaunchStatusGroupValues.find( ( value ) => value === status );
};

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
			<SitesDashboard queryParams={ queryParams } />
		</>
	);

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
