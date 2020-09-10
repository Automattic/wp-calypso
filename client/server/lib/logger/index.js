/**
 * External dependencies
 */
import bunyan from 'bunyan';

let logger;

const createLogger = () => {
	logger = bunyan.createLogger( { name: 'calypso' } );
};

export const getLogger = () => {
	if ( ! logger ) createLogger();
	return logger;
};
