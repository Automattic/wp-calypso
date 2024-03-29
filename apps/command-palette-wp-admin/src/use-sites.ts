import type { SiteExcerptData } from '@automattic/sites';

export const useSites = (): SiteExcerptData[] => {
	// Only the current site is available on WP Admin.
	const { siteId, isAtomic, isStaging, isPrivate, isComingSoon, isP2, siteHostname } =
		window.commandPaletteConfig;

	return [
		{
			ID: siteId,
			slug: siteHostname,
			is_wpcom_atomic: isAtomic,
			is_coming_soon: isComingSoon,
			options: { is_wpforteams_site: isP2 },
			is_private: isPrivate,
			is_wpcom_staging_site: isStaging,
		},
	];
};
