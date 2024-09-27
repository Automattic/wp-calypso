import { getAnyLanguageRouteParam } from '@automattic/i18n-utils';
import { makeLayout, ssrSetupLocale } from 'calypso/controller';
import { discoverSsr } from './controller';

export default function ( router ) {
	const anyLangParam = getAnyLanguageRouteParam();

	router( [ '/discover', `/${ anyLangParam }/discover` ], ssrSetupLocale, discoverSsr, makeLayout );
}
