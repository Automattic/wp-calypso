import type { UrlData } from 'calypso/blocks/import/types';

/**
 * Whether the URL analyzer couldn't load the source. The health is from our own fetch of the
 * homepage, not from how the migration will reach the site, and a site we know is WordPress can
 * still be migrated when its homepage is a 404.
 */
export const isSourceUnreachable = ( siteInfo: UrlData | undefined, error: unknown ) => {
	const hasError = !! error;
	const errorData =
		error && typeof error === 'object' && 'data' in error ? ( error.data as unknown ) : undefined;
	const errorHealth =
		errorData && typeof errorData === 'object' && 'site_health' in errorData
			? errorData.site_health
			: undefined;
	const siteHealth = hasError ? errorHealth : siteInfo?.site_health;
	let isUnhealthy = typeof siteHealth === 'string' && siteHealth !== 'ok';
	if ( isUnhealthy && ! hasError && siteInfo?.platform === 'wordpress' ) {
		isUnhealthy = siteHealth !== 'not_found';
	}
	const errorCode = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
	return (
		( ! siteInfo || hasError || [ 'wordpress', 'unknown' ].includes( siteInfo.platform ) ) &&
		( isUnhealthy ||
			( hasError &&
				( errorCode === 'http_request_failed' || errorCode === 'rest_invalid_param' ) ) )
	);
};
