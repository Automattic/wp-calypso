/**
 * WordPress dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';
import createExPlatClientReactHelpers from '@automattic/explat-client-react-helpers';

/**
 * Internal dependencies
 */
import { getAnonId, initializeAnonId } from './internals/anon-id';
import fetchExperimentAssignment from './internals/fetch-experiment-assignment';
import { logError } from './internals/log-error';
import { isDevelopmentMode } from './internals/misc';

initializeAnonId().catch( ( e ) => logError( { message: e.message } ) );

const exPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export const { loadExperimentAssignment, dangerouslyGetExperimentAssignment } = exPlatClient;
const exPlatClientReactHelpers = createExPlatClientReactHelpers( exPlatClient );
export const { useExperiment, Experiment, ProvideExperimentData } = exPlatClientReactHelpers;
