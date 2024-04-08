import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import { buildQueryString } from '@wordpress/url';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';

export const URL_REFERRER_PARAM = 'pattern-library';

export function getCategoryUrlPath(
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

export function getOnboardingUrl() {
	return `/setup/assembler-first?${ buildQueryString( {
		ref: URL_REFERRER_PARAM,
	} ) }`;
}
