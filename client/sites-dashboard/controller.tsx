import { Global, css } from '@emotion/react';
import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from 'page';

export const globalStyles = css`
	body.is-group-sites-dashboard {
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
			<SitesDashboard launchStatus={ context.query.status } />
		</>
	);
	next();
}
