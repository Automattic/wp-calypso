/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns cached top-level-domain specific contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @return {Object}              TLD Specific Contact details
 */
export default function getContactDetailsExtraCache( state ) {
	return get( state, 'domains.management.items._contactDetailsCache.extra', {} );
}
