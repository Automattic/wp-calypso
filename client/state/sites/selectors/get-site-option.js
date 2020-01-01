/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOptions from 'state/selectors/get-site-options';

/**
 * Returns a site option for a site
 *
 * @param  {object}  state  Global state tree
 * @param  {?Number}  siteId Site ID
 * @param  {string}  optionName The option key
 * @return {*}  The value of that option or null
 */
export default function getSiteOption( state, siteId, optionName ) {
	return get( getSiteOptions( state, siteId ), optionName, null );
}
