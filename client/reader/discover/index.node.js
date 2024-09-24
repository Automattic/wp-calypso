import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, redirectInvalidLanguage, ssrSetupLocale } from 'calypso/controller';
import { updateLastRoute } from 'calypso/reader/controller';
import { discoverSsr } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	router( `/${ anyLangParam }/discover`, redirectInvalidLanguage );

	console.log( 'SSR!' );

	router(
		[ '/discover', `/${ langParam }/discover` ],
		ssrSetupLocale,
		updateLastRoute,
		discoverSsr,
		makeLayout
	);
}
