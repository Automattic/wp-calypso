/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * Returns gaining registrar data for a given domain, if we've successfully
 * completed the transfer from our side.
 *
 * @param  {object}  state       Global state tree
 * @param  {string}  domain      Domain
 * @returns {object}              Registrar object/record
 */
export default function getGainingRegistrar( state, domain ) {
	return get( state.domains.transfer, [ 'items', domain, 'selectedRegistrar' ], {} );
}
