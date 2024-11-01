import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import StagingSite from './components/staging-site';

export function renderStagingSite( context, next ) {
	context.primary = (
		<>
			<PageViewTracker path="/staging-site/:site" title="Staging Site" />
			<StagingSite />
		</>
	);
	next();
}
