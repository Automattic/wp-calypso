/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/domains/init';

/**
 * @typedef {import('calypso/my-sites/checkout/composite-checkout/types/backend/domain-contact-details-components').PossiblyCompleteDomainContactDetails} PossiblyCompleteDomainContactDetails
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
