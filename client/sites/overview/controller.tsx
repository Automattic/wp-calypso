import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getRouteFromContext } from 'calypso/utils';
import HostingOverview from './components/hosting-overview';
import type { Context as PageJSContext } from '@automattic/calypso-router';

export function overview( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker title="Sites > Overview" path={ getRouteFromContext( context ) } />
			<HostingOverview />
		</>
	);
	next();
}
