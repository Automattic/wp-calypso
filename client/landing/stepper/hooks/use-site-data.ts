import { useSite } from './use-site';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';

export const useSiteData = () => {
	const site = useSite();
	const siteSlug = useSiteSlugParam() ?? '';
	const siteId = Number( useSiteIdParam() ) ?? 0;
	const siteSlugOrId = siteSlug ? siteSlug : siteId;

	return {
		site,
		siteSlug,
		siteId,
		siteSlugOrId,
	};
};
