import { get } from 'lodash';

import 'calypso/state/domains/init';

/**
 * Returns gaining registrar data for a given domain, if we've successfully
 * completed the transfer from our side.
 *
 * @param  {Object}  state       Global state tree
 * @param  {string}  domain      Domain
 * @returns {Object}              Registrar object/record
 */
export default function getGainingRegistrar( state, domain ) {
	return get( state.domains.transfer, [ 'items', domain, 'selectedRegistrar' ], {} );
}
