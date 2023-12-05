import { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';
import { siteDefaultInterface } from './utils';

export const generateLink = ( site: SiteExcerptData, calypsoBase: string, wpAdminBase: string ) => {
	const isWpAdminDefault =
		( site.jetpack && ! site.is_wpcom_atomic ) || siteDefaultInterface( site ) === 'wp-admin';

	const targetLink = isWpAdminDefault
		? `${ site.URL }/wp-admin/${ wpAdminBase }`
		: `${ calypsoBase }/${ site.slug }`;

	return targetLink;
};
