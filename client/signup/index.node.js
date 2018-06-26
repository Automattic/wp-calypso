/** @format */

/**
 * Internal dependencies
 */
import { getLanguage, getLanguageSlugs } from 'lib/i18n-utils';

const lang = `:lang(${ getLanguageSlugs().join( '|' ) })`;

export default function( router ) {
	router( `/start/:flowName/:stepName/:stepSectionName/${ lang }`, setUpLocale );
	router( `/start/:flowName/:stepName/${ lang }`, setUpLocale );
	router( `/start/:flowName/${ lang }`, setUpLocale );
	router( `/start/${ lang }`, setUpLocale );
}

// Set up the locale if there is one
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
