import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
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
	const anyLangParam = getAnyLanguageRouteParam();

	router(
		[ '/discover', `/${ anyLangParam }/discover` ],
		redirectInvalidLanguage,
		redirectWithoutLocaleParamInFrontIfLoggedIn,
		setLocaleMiddleware(),
		updateLastRoute,
		sidebar,
		discover,
		makeLayout,
		clientRender
	);
}
