/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { findRegistrantWhois } from 'lib/domains/whois/utils';

/**
 * Returns registrant's domain contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  domain      Domain to query details
 * @return {Object}              Contact details
 */
export default function getRegistrantWhois( state, domain ) {
	const whoisContacts = get( state, [ 'domains', 'management', 'items', domain ], [] );
	return findRegistrantWhois( whoisContacts );
}
