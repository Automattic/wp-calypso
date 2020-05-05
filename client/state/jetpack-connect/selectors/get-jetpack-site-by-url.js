/**
 * Internal dependencies
 */
import { getSiteByUrl } from 'state/sites/selectors';

import 'state/jetpack-connect/init';

export const getJetpackSiteByUrl = ( state, url ) => {
	const site = getSiteByUrl( state, url );
	if ( site && ! site.jetpack ) {
		return null;
	}
	return site;
};
