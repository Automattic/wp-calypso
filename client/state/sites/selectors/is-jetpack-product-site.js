import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if site is a Jetpack site with a product plugin installed ( i.e. Jetpack Backup )
 * false if the site has the full Jetpack plugin or is hosted on WordPress.com, or null if the site is unknown.
 *
 * @param  {object}   state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site is a Jetpack site
 */
export default function isJetpackProductSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return (
		( site?.options?.jetpack_connection_active_plugins || [] ).filter(
			( plugin ) => plugin !== 'jetpack'
		).length > 0
	);
}
