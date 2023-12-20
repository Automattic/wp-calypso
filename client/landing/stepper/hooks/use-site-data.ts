import { urlToSlug } from 'calypso/lib/url';
import { useSite } from './use-site';
import { useSiteIdParam } from './use-site-id-param';
import { useSiteSlugParam } from './use-site-slug-param';

export const useSiteData = () => {
	const site = useSite();
	const siteSlugParam = useSiteSlugParam() ?? '';
	const siteIdParam = Number( useSiteIdParam() ) ?? 0;
	const siteSlug = site?.URL ? urlToSlug( site?.URL ?? '' ) : siteSlugParam;
	const siteId = site?.ID ?? siteIdParam;
	const siteSlugOrId = siteSlug ? siteSlug : siteId;

	return {
		site,
		siteSlug,
		siteId,
		siteSlugOrId,
	};
};
