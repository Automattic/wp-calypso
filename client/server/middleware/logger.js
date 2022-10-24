import config from '@automattic/calypso-config';
import uaParser from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import { getLogger } from 'calypso/server/lib/logger';

const NS_TO_MS = 1e-6;

const parseUA = ( rawUA ) => {
	const parsedUA = uaParser( rawUA );
	if ( parsedUA.browser.name && parsedUA.browser.version ) {
		const version = parsedUA.browser.version.split( '.' )[ 0 ];
		return `${ parsedUA.browser.name } ${ version }`;
	}
	return rawUA;
};

const logRequest = ( req, res, options ) => {
	const { requestStart } = options;

	const message = res.finished ? 'request finished' : 'request closed';

	const fields = {
		method: req.method,
		status: res.statusCode,
		length: res.get( 'content-length' ),
		duration: Number(
			( Number( process.hrtime.bigint() - requestStart ) * NS_TO_MS ).toFixed( 3 )
		),
		httpVersion: req.httpVersion,
		rawUserAgent: req.get( 'user-agent' ),
		remoteAddr: req.ip,
		referrer: req.get( 'referer' ),
	};

	req.logger.info( fields, message );
};

export default () => {
	const logger = getLogger();
	const env = config( 'env_id' );

	return ( req, res, next ) => {
		req.logger = logger.child( {
			reqId: uuidv4(),
			url: req.originalUrl,
			appVersion: process.env.COMMIT_SHA,
			env,
			userAgent: parseUA( req.get( 'user-agent' ) ),
			path: req.path,
		} );
		const requestStart = process.hrtime.bigint();
		res.on( 'close', () => logRequest( req, res, { requestStart } ) );
		next();
	};
};
