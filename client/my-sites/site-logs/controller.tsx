import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SiteLogs } from './main';

export const siteLogs: PageJS.Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/site-logs/:site" title="Site logs" delay={ 500 } />
			<SiteLogs />
		</>
	);
	next();
};
