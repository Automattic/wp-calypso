/**
 * Internal dependencies
 */
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import { requestSites } from 'calypso/state/sites/actions';

async function fetchSitesUntilSiteAppears( siteSlug, reduxStore ) {
	while ( ! getSiteId( reduxStore.getState(), siteSlug ) ) {
		await reduxStore.dispatch( requestSites() );
	}
}

export function fetchSitesAndUser( siteSlug, onComplete, reduxStore ) {
	Promise.all( [
		fetchSitesUntilSiteAppears( siteSlug, reduxStore ),
		reduxStore.dispatch( fetchCurrentUser() ),
	] ).then( onComplete );
}
