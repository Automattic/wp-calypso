import type { Site } from '@automattic/api-core';

export const DEFAULT_PROVIDER_NAME = 'Unknown';

const isWordPressComProvider = ( site: Site ) => {
	return (
		site.is_wpcom_atomic ||
		site.is_a8c ||
		site.is_garden ||
		site.is_wpcom_staging_site ||
		site.is_vip ||
		site.is_wpcom_flex ||
		site.slug.endsWith( 'wordpress.com' )
	);
};

export function getSiteProviderName( site: Site ) {
	/**
	 * `hosting_provider_guess` frequently returns 'unknown'.
	 * Use site properties to determine if we are the provider.
	 */
	const provider = site.hosting_provider_guess;

	let providerName;
	if ( provider === 'jurassic_ninja' ) {
		providerName = 'Jurassic Ninja';
	} else if ( provider === 'pressable' ) {
		providerName = 'Pressable';
	} else if ( isWordPressComProvider( site ) ) {
		providerName = 'WordPress.com';
	} else if ( site.jetpack ) {
		providerName = 'Jetpack';
	}

	return providerName;
}
