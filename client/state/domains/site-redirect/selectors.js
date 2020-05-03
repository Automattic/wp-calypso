/**
 * Internal dependencies
 */
import { initialStateForSite } from './reducer';

export function getSiteRedirectLocation( state, siteId ) {
	return state.domains.siteRedirect[ siteId ] || initialStateForSite;
}
