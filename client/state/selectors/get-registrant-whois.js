/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { findRegistrantWhois } from 'calypso/lib/domains/whois/utils';

import 'calypso/state/domains/init';

/**
 * Returns registrant's domain contact details if we've successfully requested them.
 *
 * @param  {object}  state       Global state tree
 * @param  {string}  domain      Domain to query details
 * @returns {object}              Contact details
 */
export default function getRegistrantWhois( state, domain ) {
	const whoisContacts = get( state, [ 'domains', 'management', 'items', domain ], [] );
	return findRegistrantWhois( whoisContacts );
}
