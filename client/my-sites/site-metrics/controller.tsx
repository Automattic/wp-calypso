import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import { SiteMetrics } from './main';

export const siteMetrics: PageJS.Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/site-metrics/:site" title="Site metrics" delay={ 500 } />
			<SiteMetrics />
		</>
	);
	next();
};
