import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import page from 'page';
import {
	makeLayout,
	redirectInvalidLanguage,
	redirectLoggedInUrl,
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
		redirectLoggedInUrl,
		setLocaleMiddleware(),
		updateLastRoute,
		sidebar,
		discover,
		makeLayout,
		clientRender
	);
}
