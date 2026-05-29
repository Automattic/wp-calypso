import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import StagingSite from './components/staging-site';

export function stagingSite( context, next ) {
	context.primary = (
		<div>
			<PageViewTracker path="/staging-site/:site" title="Sites > Staging Site" />
			<StagingSite />
		</div>
	);
	next();
}
