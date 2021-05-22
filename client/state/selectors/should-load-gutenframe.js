/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import { getPreference } from 'calypso/state/preferences/selectors';

export const shouldLoadGutenframe = ( state, siteId ) => {
	return (
		isEligibleForGutenframe( state, siteId ) &&
		( ! isNavUnificationEnabled( state ) || ! getPreference( state, 'linkDestination' ) )
	);
};
export default shouldLoadGutenframe;
