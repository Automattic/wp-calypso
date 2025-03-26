import crypto from 'crypto';
import config from '@automattic/calypso-config';
import uaParser from 'ua-parser-js';
import isStaticRequest from 'calypso/server/lib/is-static-request';
import { getLogger } from 'calypso/server/lib/logger';
import { finalizePerfMarks } from 'calypso/server/lib/performance-mark';

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

	// Let's not log static file requests in dev mode, since it adds a ton of unhelpful noise.
	if ( process.env.NODE_ENV === 'development' && isStaticRequest( req ) ) {
		return;
	}

	const message = res.finished ? 'request finished' : 'request closed';
	// Duration in ms.
	const duration = Number(
		( Number( process.hrtime.bigint() - requestStart ) * NS_TO_MS ).toFixed( 3 )
	);
	const fields = {
		method: req.method,
		status: res.statusCode,
		length: res.get( 'content-length' ),
		duration,
		httpVersion: req.httpVersion,
		rawUserAgent: req.get( 'user-agent' ),
		remoteAddr: req.ip,
		referrer: req.get( 'referer' ),
	};
	req.logger.info( fields, message );

	// Requests which take longer than one second aren't performing well. We log
	// extra performance data in this case to troubleshoot the cause.
	if ( duration > 1000 ) {
		req.logger.info(
			// TODO: does warn not exist here for tests?
			{
				performanceMarks: finalizePerfMarks( req.context ),
				didTimeout: duration > 49500, // A timeout occurs at 50s, so anything close to that is likely a timeout.
				duration,
			},
			'long request duration'
		);
	}
};

export default () => {
	const logger = getLogger();
	const env = config( 'env_id' );

	return ( req, res, next ) => {
		req.logger = logger.child( {
			reqId: crypto.randomUUID(),
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
