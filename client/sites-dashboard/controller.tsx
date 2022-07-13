import { Global, css } from '@emotion/react';
import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from 'page';

const globalStyles = css`
	body.is-group-sites {
		background: #fdfdfd;

		.layout__content {
			// The page header background extends all the way to the edge of the screen
			padding: 32px 0;
		}
	}
`;

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
