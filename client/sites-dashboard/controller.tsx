import { Global, css } from '@emotion/react';
import { SitesDashboard } from './components/sites-dashboard';
import type { Context as PageJSContext } from 'page';

const globalStyles = css`
	body.is-group-sites-dashboard {
		background: #fdfdfd;
	}
`;

export function sitesDashboard( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<Global styles={ globalStyles } />
			<SitesDashboard />
		</>
	);
	next();
}
