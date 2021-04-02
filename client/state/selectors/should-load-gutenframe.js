/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import getUserSettings from 'calypso/state/selectors/get-user-settings';

export const shouldLoadGutenframe = ( state, siteId ) => {
	return (
		isEligibleForGutenframe( state, siteId ) &&
		( ! isNavUnificationEnabled( state ) ||
			! getUserSettings( state )?.calypso_preferences?.linkDestination )
	);
};
export default shouldLoadGutenframe;
