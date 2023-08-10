import { isEnabled } from '@automattic/calypso-config';
import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { SiteMetrics } from './main';

export const siteMetrics: PageJS.Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/site-monitoring/:site" title="Site Monitoring" delay={ 500 } />
			<SiteMetrics />
		</>
	);
	next();
};

export const redirectHomeIfIneligible: PageJS.Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( ! isEnabled( 'yolo/hosting-metrics-i1' ) ) {
		context.page.replace( `/home/${ context.params.siteId }` );
		return;
	}

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
