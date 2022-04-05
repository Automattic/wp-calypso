import { useSiteSettingsQuery } from './use-site-settings-query';

export function useSiteSettings( siteIdOrSlug: number | string | null ) {
	const { data } = useSiteSettingsQuery( siteIdOrSlug );
	return data?.settings;
}
