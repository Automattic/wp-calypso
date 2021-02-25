/**
 * WordPress dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';

/**
 * Internal dependencies
 */
import { getAnonId, initializeAnonId } from './internals/anon-id';
import fetchExperimentAssignment from './internals/fetch-experiment-assignment';
import { logError } from './internals/log-error';
import { isDevelopmentMode } from './internals/misc';

initializeAnonId().catch( ( e ) => logError( { message: e.message } ) );

const ExPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export default ExPlatClient;
