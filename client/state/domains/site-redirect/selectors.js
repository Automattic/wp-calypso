import { initialStateForSite } from './reducer';

import 'calypso/state/domains/init';

export function getSiteRedirectLocation( state, siteId ) {
	console.log( { state: state } );
	return state.domains.siteRedirect[ siteId ] || initialStateForSite;
}
