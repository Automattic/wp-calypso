/**
 * Internal dependencies
 */
import { getLogger } from 'server/lib/logger';

const NS_TO_MS = 1e-6;

const logRequest = ( req, res, options ) => {
	const { requestStart } = options;

	let fields = {
		method: req.method,
		status: res.statusCode,
		length: res.get( 'content-length' ),
		url: req.originalUrl,
		duration: Number(
			( Number( process.hrtime.bigint() - requestStart ) * NS_TO_MS ).toFixed( 3 )
		),
	};

	if ( process.env.NODE_ENV === 'production' ) {
		// Standard Apache combined log output minus the remote-user
		fields = {
			...fields,
			remoteAddr: req.ip,
			httpVersion: req.httpVersionMajor + '.' + req.httpVersionMinor,
			referrer: req.get( 'referer' ),
			userAgent: req.get( 'user-agent' ),
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
