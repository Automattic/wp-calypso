/**
 * External dependencies
 */
import { endsWith, includes, split } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getLanguage } from 'lib/i18n-utils';

/**
 * Sets language properties to context if
 * a WordPress.com language slug is detected in the hostname
 */
export default () => ( req, res, next ) => {
	const langSlug = endsWith( req.hostname, config( 'hostname' ) )
		? split( req.hostname, '.' )[ 0 ]
		: null;

	if ( langSlug && includes( config( 'magnificent_non_en_locales' ), langSlug ) ) {
		// Retrieve the language object for the RTL information.
		const language = getLanguage( langSlug );

		// Switch locales only in a logged-out state.
		if ( language && ! req.context.isLoggedIn ) {
			req.context = {
				...req.context,
				lang: language.langSlug,
				isRTL: !! language.rtl,
			};
		} else {
			// Strip the langSlug and redirect using hostname
			// so that the user's locale preferences take priority.
			const protocol = req.get( 'X-Forwarded-Proto' ) === 'https' ? 'https' : 'http';
			const port = process.env.PORT || config( 'port' ) || '';
			const hostname = req.hostname.substr( langSlug.length + 1 );
			const redirectUrl = `${ protocol }://${ hostname }:${ port }${ req.path }`;
			return res.redirect( redirectUrl );
		}
	}
	next();
};
