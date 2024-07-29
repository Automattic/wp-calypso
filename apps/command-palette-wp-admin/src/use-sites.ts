import type { SiteExcerptData } from '@automattic/sites';

export const useSites = (): SiteExcerptData[] => {
	const {
		siteId,
		isAtomic,
		isStaging,
		isPrivate,
		isComingSoon,
		isP2,
		siteHostname,
		siteName,
		shouldUseWpAdmin,
		isWpcomStore,
	} = window.commandPaletteConfig;

	// Only the current site is available on WP Admin.
	return [
		{
			ID: siteId,
			slug: siteHostname,
			name: siteName,
			jetpack: isAtomic,
			is_wpcom_atomic: isAtomic,
			is_coming_soon: isComingSoon,
			options: {
				is_wpforteams_site: isP2,
				wpcom_admin_interface: shouldUseWpAdmin ? 'wp-admin' : 'calypso',
				is_wpcom_store: isWpcomStore,
			},
			is_private: isPrivate,
			is_wpcom_staging_site: isStaging,
		},
	];
};
