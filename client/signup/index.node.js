/**
 * Internal dependencies
 */
import { getLanguage, getLanguageRouteParam } from 'lib/i18n-utils';

export default function ( router ) {
	const lang = getLanguageRouteParam();

	router(
		[
			`/start/${ lang }`,
			`/start/:flowName/${ lang }`,
			`/start/:flowName/:stepName/${ lang }`,
			`/start/:flowName/:stepName/:stepSectionName/${ lang }`,
		],
		setUpLocale
	);
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
