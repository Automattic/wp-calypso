/**
 * WordPress dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';

/**
 * Internal dependencies
 */
import { getAnonId, initializeAnonId } from './internals/anon-id';
import fetchExperimentAssignment from './internals/fetch-experiment-assignment';
import { logError, isDevelopmentMode } from './internals/log-error';

initializeAnonId().catch( ( e ) => logError( { message: e.message } ) );

const ExPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export default ExPlatClient;
