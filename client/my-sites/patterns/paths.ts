import { isAssemblerSupported } from '@automattic/design-picker';
import { addLocaleToPathLocaleInFront, localizeUrl } from '@automattic/i18n-utils';
import { PatternTypeFilter } from 'calypso/my-sites/patterns/types';
import type { Locale } from '@automattic/i18n-utils';

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

export function getOnboardingUrl( locale: Locale, isLoggedIn: boolean ) {
	const refQueryString = new URLSearchParams( {
		ref: URL_REFERRER_PARAM,
	} );

	// The Assembler only works on larger viewports
	if ( isAssemblerSupported() ) {
		return localizeUrl(
			`https://wordpress.com/setup/assembler-first?${ refQueryString }`,
			locale,
			isLoggedIn
		);
	}

	return localizeUrl( `https://wordpress.com/start?${ refQueryString }`, locale, isLoggedIn );
}
