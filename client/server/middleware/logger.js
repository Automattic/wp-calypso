/**
 * External dependencies
 */
import morgan from 'morgan';

/**
 * Internal dependencies
 */
import { getLogger } from 'server/lib/logger';

const NS_TO_MS = 1e-6;

const logRequest = ( req, res, options ) => {
	const { requestStart } = options;

	// Equivalent to morgan's `dev` format
	let fields = {
		method: morgan.method( req ),
		status: morgan.status( req, res ),
		length: res.getHeader( 'Content-Length' ),
		url: morgan.url( req ),
		duration: Number(
			( Number( process.hrtime.bigint() - requestStart ) * NS_TO_MS ).toFixed( 3 )
		),
	};

	if ( process.env.NODE_ENV === 'production' ) {
		// Standard Apache combined log output.
		// Equivalent to morgan's `combined` format
		fields = {
			...fields,
			remoteAddr: morgan[ 'remote-addr' ]( req ),
			remoteUser: morgan[ 'remote-user' ]( req ),
			httpVersion: morgan[ 'http-version' ]( req ),
			referrer: morgan.referrer( req ),
			userAgent: morgan[ 'user-agent' ]( req ),
		};
	}

	req.logger.info( fields );
};

export default () => {
	const logger = getLogger();
	return ( req, res, next ) => {
		req.logger = logger;
		const requestStart = process.hrtime.bigint();
		res.on( 'finish', () => logRequest( req, res, { requestStart } ) );
		next();
	};
};
