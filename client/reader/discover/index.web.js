import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectWithoutLocaleParamInFrontIfLoggedIn,
	render as clientRender,
} from 'calypso/controller';
import { setLocaleMiddleware } from 'calypso/controller/shared';
import { sidebar, updateLastRoute } from 'calypso/reader/controller';
import { discover } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	router( `/${ anyLangParam }/discover`, redirectInvalidLanguage );

	console.log( 'NON-SSR...' );

	router(
		[ '/discover', `/${ langParam }/discover` ],
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		updateLastRoute,
		sidebar,
		discover,
		makeLayout,
		clientRender
	);
}
