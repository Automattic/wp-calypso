import {
	makeLayout,
	ssrSetupLocale,
	setHrefLangLinks,
	setLocalizedCanonicalUrl,
} from 'calypso/controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';
import { details, fetchThemeDetailsData, notFoundError } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( '/theme', ( { res } ) => res.redirect( '/themes' ) );
	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		ssrSetupLocale,
		fetchThemeDetailsData,
		details,
		setHrefLangLinks,
		setLocalizedCanonicalUrl,
		makeLayout,

		// Error handlers
		notFoundError
	);
}
