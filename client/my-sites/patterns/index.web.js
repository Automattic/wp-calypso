import { getLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, redirectWithoutLocaleParamInFrontIfLoggedIn } from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { fetchPatterns, renderPatterns } from 'calypso/my-sites/patterns/controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/patterns', `/${ langParam }/patterns` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		fetchPatterns,
		renderPatterns,
		makeLayout
	);
}
