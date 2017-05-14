/**
 * Returns domain contact details if we've successfully requested them.
 *
 * @param  {Object}  state       Global state tree
 * @param  {String}  domain      Domain to query details
 * @return {Object}              Contact details
 */
export default function getDomainContactInformation( state, domain ) {
	return state.domains.management[ domain ];
}
