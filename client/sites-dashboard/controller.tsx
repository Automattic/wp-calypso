import {
	DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE,
	siteLaunchStatusFilterValues,
} from '@automattic/components';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SitesDashboard } from './components/sites-dashboard';
import { MEDIA_QUERIES } from './utils';
import type { Context as PageJSContext } from 'page';

const globalStyles = css`
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

const getStatusFilterValue = ( status?: string ) => {
	return siteLaunchStatusFilterValues.find( ( value ) => value === status );
};

export function sanitizeQueryParameters( context: PageJSContext, next: () => void ) {
	/**
	 * We need a base case because `page.replace` triggers a re-render for every middleware
	 * in the route.
	 */
	if ( context.query.status === undefined ) {
		context.query.status = DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE;
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
	context.primary = (
		<>
			<Global styles={ globalStyles } />
			<PageViewTracker path="/sites" title="Sites Management Page" delay={ 500 } />
			<SitesDashboard
				queryParams={ {
					page: context.query.page ? parseInt( context.query.page ) : undefined,
					perPage: context.query[ 'per-page' ]
						? parseInt( context.query[ 'per-page' ] )
						: undefined,
					search: context.query.search,
					showHidden: context.query[ 'show-hidden' ] === 'true',
					status: context.query.status,
				} }
			/>
		</>
	);
	next();
}
