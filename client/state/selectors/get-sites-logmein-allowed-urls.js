/**
 * Internal dependencies
 */
import getSites from 'calypso/state/selectors/get-sites';

/**
 * Returns a list of users domains that need pushing through logmein
 *
 * @param  {object}  state  Global state tree
 * @returns {?string}       URLs of user's simple sites with mapped domains
 */
export default function getSitesLogmeinAllowedUrls( state ) {
	const result = getSites( state )
		.map( ( site ) =>
			! site.is_vip &&
			! site.jetpack &&
			! site.options.is_automated_transfer &&
			! site.options.is_domain_only &&
			! site.options.is_redirect &&
			! site.options.is_wpcom_atomic &&
			! site.options.is_wpcom_store &&
			! site.options.is_wpforteams_site &&
			site.options.is_mapped_domain
				? site.URL
				: false
		)
		.filter( Boolean );
	return result;
}
