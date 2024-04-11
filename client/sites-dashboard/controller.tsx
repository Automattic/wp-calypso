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
import { removeNotice } from 'calypso/state/notices/actions';
import { setAllSitesSelected } from 'calypso/state/ui/actions';
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
			background: #ffffff;

			.layout__content {
				// The page header background extends all the way to the edge of the screen
				@media only screen and ( min-width: 782px ) {
					padding-inline: 0;
				}

				// Prevents the status dropdown from being clipped when the page content
				// isn't tall enough
				overflow: inherit;
			}
		}

		// Update body margin to account for the sidebar width
		@media only screen and ( min-width: 782px ) {
			div.layout.is-global-sidebar-visible {
				.layout__primary {
					margin-inline-start: var( --sidebar-width-max );
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

	context.primary = (
		<>
			<Global styles={ sitesDashboardGlobalStyles } />
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<AsyncLoad require="calypso/lib/analytics/track-resurrections" placeholder={ null } />
			<SitesDashboard
				queryParams={ {
					page: context.query.page ? parseInt( context.query.page ) : undefined,
					perPage: context.query[ 'per-page' ]
						? parseInt( context.query[ 'per-page' ] )
						: undefined,
					search: context.query.search,
					status: context.query.status,
					newSiteID: parseInt( context.query[ 'new-site' ] ) || undefined,
				} }
			/>
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
