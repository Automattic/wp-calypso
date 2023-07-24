import {
	DEFAULT_SITE_LAUNCH_STATUS_GROUP_VALUE,
	siteLaunchStatusGroupValues,
} from '@automattic/sites';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import AsyncLoad from 'calypso/components/async-load';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { removeNotice } from 'calypso/state/notices/actions';
import { hideMasterbar } from 'calypso/state/ui/actions';
import { HostingFlowForkingPage } from './components/hosting-flow-forking-page';
import { SitesDashboard } from './components/sites-dashboard';
import { MEDIA_QUERIES } from './utils';
import type { Context as PageJSContext } from 'page';

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
	const sitesDashboardGlobalStyles = css`
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
