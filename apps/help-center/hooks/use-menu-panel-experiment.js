import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';

const fetchExperimentAssignment = async ( experimentName ) => {
	const result = canAccessWpcomApis()
		? await wpcomRequest( {
				path: '/experiments/0.1.0/assignments/calypso',
				apiNamespace: 'wpcom/v2',
				query: {
					experiment_name: experimentName,
				},
		  } )
		: await apiFetch( {
				path: addQueryArgs( 'jetpack/v4/explat/assignments', {
					experiment_name: experimentName,
					platform: 'calypso',
					as_connected_user: 'true',
				} ),
				global: true,
		  } );

	return result;
};

/**
 * Hook to check if the current user is in a specific experiment variation.
 * Works in both WordPress.com and Jetpack contexts.
 *
 * @param {string} experimentName - The name of the experiment to check
 * @param {string} treatmentVariation - The variation name to match against
 * @returns {{ isInTreatment: boolean, isLoading: boolean }} Object containing whether user is in the treatment variation and loading state
 *
 * @example
 * const { isInTreatment, isLoading } = useExperimentVariation(
 *   'my_experiment_name',
 *   'treatment_variation'
 * );
 */
const useExperimentVariation = ( experimentName, treatmentVariation ) => {
	const cacheKey = `experiment-assignment-v1-${ experimentName }-${ treatmentVariation }`;

	const { data: isInTreatment, isLoading } = useQuery( {
		queryKey: [ 'experiment-assignment', experimentName, treatmentVariation ],
		queryFn: async () => {
			const result = await fetchExperimentAssignment( experimentName );
			const isMatch = result?.variations?.[ experimentName ] === treatmentVariation;
			try {
				window.localStorage.setItem(
					cacheKey,
					JSON.stringify( { value: isMatch, timestamp: Date.now() } )
				);
			} catch ( e ) {
				// Silent fail if localStorage is unavailable
			}
			return isMatch;
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		initialData: () => {
			try {
				const cached = window.localStorage.getItem( cacheKey );
				if ( ! cached ) {
					return undefined;
				}
				const { value, timestamp } = JSON.parse( cached );
				const age = Date.now() - timestamp;
				const maxAge = 10 * 60 * 1000; // 10 minutes
				return age < maxAge ? value : undefined;
			} catch ( e ) {
				return undefined;
			}
		},
	} );

	return { isInTreatment, isLoading };
};

export { useExperimentVariation };
