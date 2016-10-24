/**
 * Internal dependencies
 */
import { getLanguage } from 'lib/i18n-utils';

export default function( router ) {
	router( '/start/:flowName?/:stepName?/:stepSectionName?/:lang?', setUpLocale );
	router( '/jetpack/*' ); // Required so this route doesn't 404
}

// Set up the locale in case it has ended up in the flow param
function setUpLocale( context, next ) {
	let { flowName, stepName, stepSectionName, lang } = context.params;

	if ( ! lang && stepSectionName && getLanguage( stepSectionName ) ) {
		lang = stepSectionName;
		stepSectionName = undefined;
	} else if ( ! lang && stepName && getLanguage( stepName ) ) {
		lang = stepName;
		flowName = undefined;
	} else if ( ! lang && flowName && getLanguage( flowName ) ) {
		lang = flowName;
		flowName = undefined;
	}

	context.params = Object.assign(
		{},
		context.params,
		{ flowName, stepName, stepSectionName, lang }
	);

	const language = getLanguage( lang );
	if ( language ) {
		context.lang = lang;
		if ( language.rtl ) {
			context.isRTL = true;
		}
	}

	next();
}
