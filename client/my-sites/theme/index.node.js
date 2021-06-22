/**
 * Internal dependencies
 */
import { makeLayout, ssrSetupLocale, setHrefLangLinks } from 'calypso/controller';
import { details, fetchThemeDetailsData, notFoundError } from './controller';
import { getLanguageRouteParam } from 'calypso/lib/i18n-utils';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router( '/theme', ( { res } ) => res.redirect( '/themes' ) );
	router(
		`/${ langParam }/theme/:slug/:section(setup|support)?/:site_id?`,
		ssrSetupLocale,
		fetchThemeDetailsData,
		details,
		setHrefLangLinks,
		makeLayout,

		// Error handlers
		notFoundError
	);
}
