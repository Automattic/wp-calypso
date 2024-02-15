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
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { removeNotice } from 'calypso/state/notices/actions';
import { hideMasterbar } from 'calypso/state/ui/actions';
import { HostingFlowForkingPage } from './components/hosting-flow-forking-page';
import { SitesDashboard } from './components/sites-dashboard';
import { MEDIA_QUERIES } from './utils';
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

export function maybeSitesDashboard( context: PageJSContext, next: () => void ) {
	if ( context.query[ 'hosting-flow' ] ) {
		return hostingFlowForkingPage( context, next );
	}

	return sitesDashboard( context, next );
}

function hostingFlowForkingPage( context: PageJSContext, next: () => void ) {
	context.store.dispatch( hideMasterbar() );
	const siteCount = getCurrentUser( context.store.getState() )?.site_count ?? 0;

	const hostingFlowForkingPageGlobalStyles = css`
		body.is-group-sites-dashboard {
			background: #fff;

			.layout__primary {
				margin: 100px 24px;
			}

			.layout__content {
				padding: 0 !important; /* this is overriden by other styles being injected on the page */
				min-height: auto; /* browsing a different page might inject this style on the page */
			}

			.button.is-primary {
				min-width: 160px;
				background-color: var( --studio-blue-50 );
				border-color: var( --studio-blue-50 );
			}

			.button.is-primary:active:not( :disabled ),
			.button.is-primary:hover:not( :disabled ),
			.button.is-primary:focus:not( :disabled ) {
				background-color: var( --studio-blue-60 );
				border-color: var( --studio-blue-60 );
				box-shadow: 0 0 0 2px var( --studio-blue-60 );
			}

			${ MEDIA_QUERIES.mediumOrLarger } {
				height: 100vh;

				.wpcom-site {
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	`;

	context.primary = (
		<>
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<Global styles={ hostingFlowForkingPageGlobalStyles } />
			<HostingFlowForkingPage siteCount={ siteCount } />
		</>
	);

	return next();
}

function sitesDashboard( context: PageJSContext, next: () => void ) {
	let sitesDashboardGlobalStyles = css`
		body.is-group-sites-dashboard {
			background: #fdfdfd;

			.layout__content {
				// The page header background extends all the way to the edge of the screen
				padding-block: 32px;
				padding-inline: 0;

				${ MEDIA_QUERIES.mediumOrSmaller } {
					padding-block-start: 46px;
				}

				// Prevents the status dropdown from being clipped when the page content
				// isn't tall enough
				overflow: inherit;
			}
		}
	`;

	// Update body margin to account for the sidebar width if the new nav is enabled
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		sitesDashboardGlobalStyles = css`
			${ sitesDashboardGlobalStyles }
			body.is-group-sites-dashboard {
				margin-left: var( --sidebar-width-max );
			}
		`;
	}
	if ( isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		context.secondary = <MySitesNavigation path={ context.path } />;
	}

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
