/** @format */

/**
 * Internal dependencies
 */
import { getLanguage, getLanguageSlugs } from 'lib/i18n-utils';

const lang = `:lang(${ getLanguageSlugs().join( '|' ) })?`;

export default function( router ) {
	router( `/start/:flowName?/:stepName?/:stepSectionName?/${ lang }`, setUpLocale );
}

// Set up the locale in case it has ended up in the flow param
function setUpLocale( context, next ) {
	const language = getLanguage( context.params.lang );
	if ( language ) {
		context.lang = context.params.lang;
		if ( language.rtl ) {
			context.isRTL = true;
		}
	}

	next();
}
