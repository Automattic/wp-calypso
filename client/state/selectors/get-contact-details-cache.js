/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * @typedef {import('@automattic/wpcom-checkout').PossiblyCompleteDomainContactDetails} PossiblyCompleteDomainContactDetails
 */

/**
 * Returns cached domain contact details if we've successfully requested them.
 *
 * @param  {object}  state       Global state tree
 * @returns {null|PossiblyCompleteDomainContactDetails}              Contact details
 */
export default function getContactDetailsCache( state ) {
	return get( state, 'domains.management.items._contactDetailsCache', null );
}
