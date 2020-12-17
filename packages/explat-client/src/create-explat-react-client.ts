import { useState, useEffect } from 'react';
import { ExperimentAssignment } from './types';

// TODO: Move this to default export createExPlatReactClient(ExPlatClient)
//       It will also include the component version.

/**
 * Creates a useExperiment hook for the provided ExPlatClient.
 *
 * NOTE: Doesn't obey ExperimentAssignment TTL, that would be bad for UX.
 *
 * @param ExPlatClient
 */
export function createUseExperiment( ExPlatClient ) {
	return ( experimentName: string ) => {
		const [ isLoading, setIsLoading ] = useState< boolean >( true );
		const [
			experimentAssignment,
			setExperimentAssignment,
		] = useState< ExperimentAssignment | null >( null );

		useEffect( () => {
			let isSubscribed = true;
			ExPlatClient.getExperimentAssignment( experimentName ).then( ( experimentAssignment ) => {
				if ( isSubscribed ) {
					setExperimentAssignment( experimentAssignment );
					setIsLoading( false );
				}
			} );
			return () => {
				isSubscribed = false;
			};
		} );

		return [ isLoading, experimentAssignment ];
	};
}
