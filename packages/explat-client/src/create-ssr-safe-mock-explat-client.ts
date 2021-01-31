/**
 * Internal dependencies
 */
import { Config } from './types';
import { ExPlatClient } from './create-explat-client';
import { createNullExperimentAssignment } from './internal/experiment-assignments';

export default function createSsrSafeMockExPlatClient( config: Config ): ExPlatClient {
	return {
		loadExperimentAssignment: async ( experimentName: string ) => {
			config.logError( {
				message: 'Attempting to load ExperimentAssignment in SSR context',
				experimentName,
			} );
			return createNullExperimentAssignment();
		},
		dangerouslyGetExperimentAssignment: ( experimentName: string ) => {
			config.logError( {
				message: 'Attempting to dangerously get ExperimentAssignment in SSR context',
				experimentName,
			} );
			return createNullExperimentAssignment();
		},
	};
}
