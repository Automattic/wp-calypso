/**
 * WordPress dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';

import { fetchExperimentAssignment, getAnonId, logError, isDevelopmentMode } from './internals';

const ExPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
} );

export default ExPlatClient;
