import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMetrics } from './main';
import type { Callback } from 'page';

export const siteMetrics: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" delay={ 500 } />
			<SiteMetrics tab={ context.params.tab } />
		</>
	);
	next();
};

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( ! isAtomicSite( state, siteId ) ) {
		context.page.replace( `/home/${ context.params.siteId }` );
		return;
	}

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
		context.page.replace( `/stats/day/${ context.params.siteId }` );
		return;
	}

	next();
};
