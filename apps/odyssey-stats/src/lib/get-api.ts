import config from '@automattic/calypso-config';

/**
 * Set the API namespace based on whether the app is running in a Jetpack site or not.
 * This is needed as WP.com Simple Classic is loading Odyssey Stats, which we will use the public-api.wordpress.com APIs.
 * @returns {string} The API namespace to use.
 */
export const getApiNamespace = () => {
	return config.isEnabled( 'is_running_in_jetpack_site' ) ? 'jetpack/v4' : 'rest/v1.1';
};

/**
 * Get the API path based on the config is_running_in_jetpack_site.
 * @param jetpackPath The path to the Jetpack API endpoint.
 */
export const getApiPath = ( jetpackPath: string, params: Record< string, string | number > ) => {
	switch ( jetpackPath ) {
		case '/site/purchases':
			return `/sites/${ params.siteId }/purchases`;
		case '/site':
			return `/sites/${ params.siteId }`;
		default:
			return jetpackPath;
	}
};
