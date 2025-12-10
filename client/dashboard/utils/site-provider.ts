import type { Site } from '@automattic/api-core';

export const DEFAULT_PROVIDER_NAME = 'WordPress.com';

export function getSiteProviderName( site: Pick< Site, 'hosting_provider_guess' > ) {
	const provider = site.hosting_provider_guess;
	let providerName;
	if ( provider === 'jurassic_ninja' ) {
		providerName = 'Jurassic Ninja';
	} else if ( provider === 'pressable' ) {
		providerName = 'Pressable';
	} else if ( provider === 'automattic' ) {
		providerName = 'WordPress.com';
	}

	return providerName;
}
