/**
 * Internal dependencies
 */
import { isEligibleForGutenframe } from 'calypso/state/gutenberg-iframe-eligible/is-eligible-for-gutenframe';
import { shouldCalypsoifyJetpack } from 'calypso/state/selectors/should-calypsoify-jetpack';
import isNavUnificationEnabled from 'calypso/state/selectors/is-nav-unification-enabled';
import getUserSettings from 'calypso/state/selectors/get-user-settings';

export const shouldLoadGutenframe = ( state, siteId ) =>
	isEligibleForGutenframe( state, siteId ) &&
	shouldCalypsoifyJetpack( state, siteId ) &&
	( ! isNavUnificationEnabled( state ) ||
		! getUserSettings( state )?.calypso_preferences?.linkDestination );

export default shouldLoadGutenframe;
