/**
 * External dependencies
 */
import bunyan from 'bunyan';

let logger;

const createLogger = () => {
	logger = bunyan.createLogger( {
		name: 'calypso',
		streams: [
			{
				stream: process.stdout,
				level: 'info',
			},
		],
	} );
	if ( process.env.CALYPSO_LOGFILE ) {
		logger.addStream( {
			path: process.env.CALYPSO_LOGFILE,
			level: 'info',
		} );
	}
};

export const getLogger = () => {
	if ( ! logger ) createLogger();
	return logger;
};
