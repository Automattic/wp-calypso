import { get } from 'lodash';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import 'calypso/state/plugins/init';

export default ( state ) => {
	const siteId = getSelectedSiteId( state );

	if (
		isJetpackSite( state, siteId ) &&
		// @todo This should be updated to be more specific to Woo.com sites.
		get( state, [ 'sites', 'items', siteId, 'options', 'woocommerce_is_active' ], null )
	) {
		return true;
	}

	return false;
};
