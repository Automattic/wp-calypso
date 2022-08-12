import {
	DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE,
	siteLaunchStatusFilterValues,
} from '@automattic/components';
import { Global, css } from '@emotion/react';
import { removeQueryArgs } from '@wordpress/url';
import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from 'page';

const globalStyles = css`
	body.is-group-sites-dashboard {
		background: #fdfdfd;

		.layout__content {
			// The page header background extends all the way to the edge of the screen
			padding: 32px 0;

			// Prevents the status dropdown from being clipped when the page content
			// isn't tall enough
			overflow: inherit;
		}
	}
`;

const getStatusFilterValue = ( status?: string ) => {
	return (
		siteLaunchStatusFilterValues.find( ( value ) => value === status ) ??
		DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE
	);
};

export function sanitizeQueryParameters( context: PageJSContext, next: () => void ) {
	context.query.status = getStatusFilterValue( context.query.status );

	if ( context.query.status === DEFAULT_SITE_LAUNCH_STATUS_FILTER_VALUE ) {
		const pathWithQuery = window.location.pathname + window.location.search;
		history.replaceState( null, '', removeQueryArgs( pathWithQuery, 'status' ) );
	}

	next();
}

export function sitesDashboard( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<Global styles={ globalStyles } />
			<SitesDashboard
				queryParams={ {
					search: context.query.search,
					status: context.query.status,
				} }
			/>
		</>
	);
	next();
}
