import { get } from 'lodash';
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';

import 'calypso/state/domains/init';

/**
 * Returns registrant's domain contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @param  {string}  domain      Domain to query details
 * @returns {Object}              Contact details
 */
export default function getRegistrantWhois( state, domain ) {
	const whoisContacts = get( state, [ 'domains', 'management', 'items', domain ], [] );
	return findRegistrantWhois( whoisContacts );
}
