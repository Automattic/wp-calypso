/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { addQueryArgs } from 'calypso/lib/url';

export default () => ( req, res, next ) => {
	if ( ! config.isEnabled( 'redirect-fallback-browsers' ) ) {
		next();
		return;
	}

	if ( req.path === '/browsehappy' ) {
		next();
		return;
	}

	if ( req.cookies.bypass_target_redirection === 'true' ) {
		next();
		return;
	}

	if ( req.query.bypassTargetRedirection === 'true' ) {
		res.cookie( 'bypass_target_redirection', true, {
			expires: new Date( Date.now() + 24 * 3600 * 1000 ), // bypass redirection for 24 hours
			httpOnly: true,
			secure: true,
		} );
		next();
		return;
	}

	const isFallback = req.getTarget() === null;
	if ( ! isFallback ) {
		next();
		return;
	}

	// We need to verify in browsehappy that the "from" param actually comes
	// from calypso, so we need to include everything in the URL.
	const baseUrl = config.get( 'calypsoBaseURL' );
	const from = `${ baseUrl }${ req.originalUrl }`;

	res.redirect( addQueryArgs( { from }, '/browsehappy' ) );
};
