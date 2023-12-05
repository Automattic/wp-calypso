import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { siteDefaultInterface } from 'calypso/sites-dashboard/utils';

export const generateSiteInterfaceLink = (
	site: SiteExcerptData,
	calypsoBase: string,
	wpAdminBase: string
) => {
	const isWpAdminDefault =
		( site.jetpack && ! site.is_wpcom_atomic ) || siteDefaultInterface( site ) === 'wp-admin';

	const targetLink = isWpAdminDefault
		? `${ site.URL }/wp-admin/${ wpAdminBase }`
		: `/${ calypsoBase }/${ site.slug }`;

	return targetLink;
};
