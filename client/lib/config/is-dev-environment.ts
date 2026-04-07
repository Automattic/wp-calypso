import config from '@automattic/calypso-config';

// Environment IDs that represent non-production development contexts:
// - 'development': local dev server (calypso.localhost)
// - 'wpcalypso': Calypso Live testing environments
const DEV_ENV_IDS = new Set( [ 'development', 'wpcalypso' ] );

/**
 * Returns whether the current environment is a development or Calypso Live
 * environment. Used to keep navigation within the testing environment by
 * treating production wordpress.com routes as internal and avoiding redirects
 * to external domains (e.g. Dashboard subdomain, wp-admin).
 */
export default function isDevEnvironment(): boolean {
	return DEV_ENV_IDS.has( config( 'env_id' ) );
}
