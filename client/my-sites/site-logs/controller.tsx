import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
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

export const redirectHomeIfIneligible: PageJS.Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
		context.page.replace( `/stats/day/${ context.params.siteId }` );
		return;
	}

	if ( ! isAtomicSite( state, siteId ) ) {
		context.page.replace( `/home/${ context.params.siteId }` );
		return;
	}

	next();
};
