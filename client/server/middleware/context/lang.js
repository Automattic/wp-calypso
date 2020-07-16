/**
 * Internal dependencies
 */
import config from 'config';

export default ( req ) => {
	let lang = config( 'i18n_default_locale_slug' );

	// We assign request.context.lang in the handleLocaleSubdomains()
	// middleware function if we detect a language slug in subdomain
	if ( req.context && req.context.lang ) {
		lang = req.context.lang;
	}

	const flags = ( req.query.flags || '' ).split( ',' );

	return {
		lang,
		isRTL: config( 'rtl' ),
		useTranslationChunks:
			config.isEnabled( 'use-translation-chunks' ) ||
			flags.includes( 'use-translation-chunks' ) ||
			req.query.hasOwnProperty( 'useTranslationChunks' ),
	};
};
