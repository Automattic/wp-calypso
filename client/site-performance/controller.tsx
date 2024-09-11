import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function sitePerformance( context: PageJSContext, next: () => void ) {
	if ( ! config.isEnabled( 'performance-profiler/logged-in' ) ) {
		page.redirect( '/' );
		return;
	}

	context.primary = (
		<>
			<PageViewTracker path="/site-performance/:site" title="Site Performance" />
			<div>Site Performance</div>
		</>
	);

	next();
}
