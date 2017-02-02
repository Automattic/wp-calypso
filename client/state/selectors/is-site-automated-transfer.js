/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Returns true if site is a Automated Transfer site, false if not and null if unknown
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is an Automated Transfer site
 */
export default function isSiteAutomatedTransfer( state, siteId ) {
	return get( state, [ 'sites', 'items', siteId, 'options', 'is_automated_transfer' ], null );
}
