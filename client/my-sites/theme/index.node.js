import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { setHrefLangLinks, setLocalizedCanonicalUrl } from 'calypso/controller/localized-links';
import { details, fetchThemeDetailsData, fetchThemeFilters, notFoundError } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( '/theme', ( { res } ) => res.redirect( '/themes' ) );
	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		ssrSetupLocale,
		fetchThemeFilters,
		fetchThemeDetailsData,
		details,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		makeLayout,

		// Error handlers
		notFoundError
	);
}
