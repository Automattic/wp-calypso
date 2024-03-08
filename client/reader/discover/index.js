import page from '@automattic/calypso-router';
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

export default function () {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	page( `/${ anyLangParam }/discover`, redirectInvalidLanguage );

	page(
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
