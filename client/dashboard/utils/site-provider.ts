import type { Site } from '@automattic/api-core';

export const DEFAULT_PROVIDER_NAME = 'WordPress.com';
export function getSiteProviderName( site: Pick< Site, 'hosting_provider_guess' > ) {
	const providerNameMap: Record< string, string > = {
		automattic: 'WordPress.com',
		dreamhost: 'DreamHost',
		jurassic_ninja: 'Jurassic Ninja',
		digitalocean: 'DigitalOcean',
		pressable: 'Pressable',
	};

	return providerNameMap[ site.hosting_provider_guess ?? '' ] ?? site.hosting_provider_guess;
}
