import { getLanguageRouteParam } from '@automattic/i18n-utils';
import {
	clientRouter,
	makeLayout,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { fetchPatterns, renderPatterns } from 'calypso/my-sites/patterns/controller';

export default function ( router: typeof clientRouter ) {
	const langParam = getLanguageRouteParam();

	router(
		[ '/patterns', `/${ langParam }/patterns` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		fetchPatterns,
		renderPatterns,
		makeLayout,
		clientRender
	);
}
