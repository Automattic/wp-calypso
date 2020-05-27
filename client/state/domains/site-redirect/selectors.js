/**
 * Internal dependencies
 */
import { initialStateForSite } from './reducer';

import 'state/domains/init';

export function getSiteRedirectLocation( state, siteId ) {
	return state.domains.siteRedirect[ siteId ] || initialStateForSite;
}
