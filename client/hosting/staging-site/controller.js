import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import StagingSite from 'calypso/sites/tools/staging-site/components/staging-site';

export function renderStagingSite( context, next ) {
	context.primary = (
		<div>
			<PageViewTracker path="/staging-site/:site" title="Staging Site" />
			<StagingSite />
		</div>
	);
	next();
}
