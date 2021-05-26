/**
 * Internal dependencies
 */
import getSites from 'calypso/state/selectors/get-sites';

/**
 * Returns a list of users mapped domains
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}        URLs of any user sites that are configured as mapped domains
 */
export default function getSitesMappedDomains( state ) {
	return getSites( state )
		.map( ( site ) => ( site.options.is_mapped_domain ? site.URL : false ) )
		.filter( Boolean );
}
