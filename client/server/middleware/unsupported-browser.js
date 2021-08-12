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

	// When loading browsehappy, we need to verify that the "from" parameter was
	// passed by the calypso server and not by a 3rd party. We add the base URL
	// as a way to identify whether the URL will be safe to load. The server handling
	// the redirect will construct the base URL in the same way. Then we know
	// that the redirect is from the same origin.
	const protocol = process.env.PROTOCOL || config( 'protocol' );
	const hostname = process.env.HOST || config( 'hostname' );
	const port = process.env.PORT || config( 'port' );
	const serverURL = `${ protocol }://${ hostname }${ port ? ':' + port : '' }`;

	const from = `${ serverURL }${ req.url }`;

	res.redirect( addQueryArgs( { from }, '/browsehappy' ) );
};
