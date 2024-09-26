import { getLanguageRouteParam, getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, redirectInvalidLanguage, ssrSetupLocale } from 'calypso/controller';
import { discoverSsr } from './controller';

export default function ( router ) {
	const langParam = getLanguageRouteParam();
	const anyLangParam = getAnyLanguageRouteParam();
	router( `/${ anyLangParam }/discover`, redirectInvalidLanguage );

	router( [ '/discover', `/${ langParam }/discover` ], ssrSetupLocale, discoverSsr, makeLayout );
}
