/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import userFactory from 'lib/user';

// State actions and selectors
import getSiteId from 'state/selectors/get-site-id';
import { requestSites } from 'state/sites/actions';
import { promisify } from 'utils';

/**
 * Constants
 */
const user = userFactory();
const debug = debugFactory( 'calypso:signup:step-actions:fetch-sites-and-user' );

function fetchSitesUntilSiteAppears( siteSlug, reduxStore, callback ) {
	if ( getSiteId( reduxStore.getState(), siteSlug ) ) {
		debug( 'fetchReduxSite: found new site' );
		callback();
		return;
	}

	// Have to manually call the thunk in order to access the promise on which
	// to call `then`.
	debug( 'fetchReduxSite: requesting all sites', siteSlug );
	reduxStore
		.dispatch( requestSites() )
		.then( () => fetchSitesUntilSiteAppears( siteSlug, reduxStore, callback ) );
}

export function fetchSitesAndUser( siteSlug, onComplete, reduxStore ) {
	Promise.all( [
		promisify( fetchSitesUntilSiteAppears )( siteSlug, reduxStore ),
		new Promise( ( resolve ) => {
			user.once( 'change', resolve );
			user.fetch();
		} ),
	] ).then( onComplete );
}
