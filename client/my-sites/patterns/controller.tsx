import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

export const RENDERER_SITE_ID = 226011606; // assemblerdemo

export function getCategorySlug(
	categorySlug: string,
	type: PatternTypeFilter,
	includeLocale = true
) {
	const href =
		type === PatternTypeFilter.PAGES
			? `/patterns/layouts/${ categorySlug }`
			: `/patterns/${ categorySlug }`;

	return includeLocale ? addLocaleToPathLocaleInFront( href ) : href;
}
