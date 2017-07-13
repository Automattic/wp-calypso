/**
 * External dependencies
 */
import { get } from 'lodash';
import { getSelectedSiteId } from 'state/ui/selectors';

export function getCookieAuth( state, siteId = getSelectedSiteId( state ) ) {
	return get( state, [ 'extensions', 'woocommerce', 'sites', siteId, 'auth' ] );
}
