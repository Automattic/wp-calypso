import { isAssemblerSupported } from '@automattic/design-picker';
import { addLocaleToPathLocaleInFront, localizeUrl } from '@automattic/i18n-utils';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';
import type { Locale } from '@automattic/i18n-utils';

export const URL_REFERRER_PARAM = 'pattern-library';

export function getCategoryUrlPath(
	categorySlug: string,
	type: PatternTypeFilter,
	includeLocale = true,
	isGridView = false
) {
	const href =
		type === PatternTypeFilter.PAGES
			? `/patterns/layouts/${ categorySlug }`
			: `/patterns/${ categorySlug }`;

	const hrefWithLocale = includeLocale ? addLocaleToPathLocaleInFront( href ) : href;

	return hrefWithLocale + ( isGridView ? '?grid=1' : '' );
}

export function getOnboardingUrl( locale: Locale, isLoggedIn: boolean ) {
	const refQuery = new URLSearchParams( {
		ref: URL_REFERRER_PARAM,
	} );

	// The Assembler only works on larger viewports
	if ( isAssemblerSupported() ) {
		return localizeUrl(
			`https://wordpress.com/setup/assembler-first?${ refQuery }`,
			locale,
			isLoggedIn
		);
	}

	return localizeUrl( `https://wordpress.com/start?${ refQuery }`, locale, isLoggedIn );
}
