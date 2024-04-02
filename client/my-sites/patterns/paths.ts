import { addLocaleToPathLocaleInFront, localizeUrl } from '@automattic/i18n-utils';
import { buildQueryString } from '@wordpress/url';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';
import type { Locale } from '@automattic/i18n-utils';

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

export function getOnboardingUrl( locale: Locale, isLoggedIn: boolean ) {
	return localizeUrl(
		`https://wordpress.com/setup/assembler-first?${ buildQueryString( {
			ref: 'pattern-library',
		} ) }`,
		locale,
		isLoggedIn
	);
}
