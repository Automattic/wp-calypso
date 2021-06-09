/**
 * Internal dependencies
 */
import getSiteOptions from 'calypso/state/selectors/get-site-options';

/**
 * Returns a site option for a site
 *
 * @param  {object}  state  Global state tree
 * @param  {?number}  siteId Site ID
 * @param  {string}  optionName The option key
 * @returns {*}  The value of that option or null
 */
export default function getSiteOption( state, siteId, optionName ) {
	const options = getSiteOptions( state, siteId );
	return options?.[ optionName ] ?? null;
}
