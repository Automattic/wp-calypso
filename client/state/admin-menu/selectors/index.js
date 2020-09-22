/**
 * Internal dependencies
 */
import 'state/inline-help/init';

import { getCurrentRoute } from 'state/selectors/get-current-route';
import { isUnderDomainManagementAll } from 'my-sites/domains/paths';
import { isUnderEmailManagementAll } from 'my-sites/email/paths';

export function getAdminMenu( state, siteId ) {
	const stateSlice = state?.adminMenu;

	if ( ! stateSlice || ! siteId ) {
		return null;
	}

	return state.adminMenu[ siteId ] || null;
}

export function getIsAllDomainsView( state ) {
	const currentRoute = getCurrentRoute( state );
	return isUnderDomainManagementAll( currentRoute ) || isUnderEmailManagementAll( currentRoute );
}
