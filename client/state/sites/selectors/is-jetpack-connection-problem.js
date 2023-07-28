import getSite from './get-site';

/**
 * Returns true if the current site has possible Jetpack connection problem
 *
 * @param  {Object}   state         Global state tree
 * @param  {number}   siteId        Site ID
 * @returns {?boolean}               Whether the current site can have connection problem
 */
export default function isJetpackConnectionProblem( state, siteId ) {
	const site = getSite( state, siteId );

	if ( ! site ) {
		return null;
	}

	return site.jetpack_connection_problem;
}
