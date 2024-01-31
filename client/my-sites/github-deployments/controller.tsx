import { isEnabled } from '@automattic/calypso-config';
import { PageViewTracker } from 'calypso/lib/analytics/page-view-tracker';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { GitHubDeployments } from './main';
import type { Callback } from '@automattic/calypso-router';

export const githubDeployments: Callback = ( context, next ) => {
	context.primary = (
		<>
			<PageViewTracker path="/github-deployments/:site" title="GitHub Deployments" delay={ 500 } />
			<GitHubDeployments />
		</>
	);
	next();
};

export const redirectHomeIfIneligible: Callback = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );

	if ( ! isEnabled( 'github-integration-i1' ) || ! isAtomicSite( state, siteId ) ) {
		context.page.replace( `/home/${ context.params.siteId }` );
		return;
	}

	if ( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) ) {
		context.page.replace( `/stats/day/${ context.params.siteId }` );
		return;
	}

	next();
};
