/**
 * Returns cached domain contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @return {Object}              Contact details
 */
export default function getContactDetailsCache( state ) {
	return state.domains.management.contactDetailsCache;
}
