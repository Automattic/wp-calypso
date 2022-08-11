import { DEFAULT_SITE_STATUS_FILTER_VALUE, siteStatusFilterValues } from '@automattic/components';
import { Global, css } from '@emotion/react';
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
		siteStatusFilterValues.find( ( value ) => value === status ) ?? DEFAULT_SITE_STATUS_FILTER_VALUE
	);
};

export function sitesDashboard( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<Global styles={ globalStyles } />
			<SitesDashboard
				queryParams={ {
					search: context.query.search,
					status: getStatusFilterValue( context.query.status ),
				} }
			/>
		</>
	);
	next();
}
