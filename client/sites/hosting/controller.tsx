import { Context as PageJSContext } from '@automattic/calypso-router';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getRouteFromContext } from 'calypso/utils';
import HostingFeatures from './components/hosting-features';

export function hostingFeatures( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker title="Sites > Hosting Features" path={ getRouteFromContext( context ) } />
			<HostingFeatures />
		</>
	);

	next();
}
