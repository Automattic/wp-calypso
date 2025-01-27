import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { SiteMonitoring } from 'calypso/sites/tools/monitoring/components/site-monitoring';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { Context as PageJSContext, Callback } from '@automattic/calypso-router';

export function siteMonitoring( context: PageJSContext, next: () => void ) {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" />
			<SiteMonitoring />
		</>
	);

	next();
}

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const isAtomicSite = !! site?.is_wpcom_atomic || !! site?.is_wpcom_staging_site;

	if ( ! isAtomicSite ) {
		context.page.replace( `/overview/${ site?.slug }` );
		return;
	}
	next();
};
