import config from '@automattic/calypso-config';

/**
 * Set the API namespace based on whether the app is running in a Jetpack site or not.
 * This is needed as WP.com Simple Classic is loading Odyssey Stats, which we will use the public-api.wordpress.com APIs.
 * @param namespace The namespace to use when running in a Jetpack site.
 * @param wpcomNamespace The namespace to use on WP.com Simple Classic (the public-api.wordpress.com REST version).
 * @returns {string} The API namespace to use.
 */
export const getApiNamespace = (
	namespace = 'jetpack/v4',
	wpcomNamespace = 'rest/v1.1'
): string => {
	return config.isEnabled( 'is_running_in_jetpack_site' ) ? namespace : wpcomNamespace;
};

/**
 * Get the API path based on the config is_running_in_jetpack_site.
 * @param jetpackPath The path to the Jetpack API endpoint.
 * @param params Contains 'siteId' and optional additional parameters.
 */
export const getApiPath = ( jetpackPath: string, params: Record< string, string | number > ) => {
	if ( config.isEnabled( 'is_running_in_jetpack_site' ) ) {
		return jetpackPath;
	}
	switch ( jetpackPath ) {
		case '/site/purchases':
			return `/sites/${ params.siteId }/purchases`;
		case '/site':
			return `/sites/${ params.siteId }`;
		case '/memberships/products':
			return `/sites/${ params.siteId }/memberships/products`;
		default:
			return jetpackPath;
	}
};
