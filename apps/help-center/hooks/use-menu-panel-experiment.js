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

const useMenuPanelExperiment = ( experimentName, treatmentVariation ) => {
	const cacheKey = `menu-panel-experiment-assignment-v2-${ experimentName }-${ treatmentVariation }`;

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

export { useMenuPanelExperiment };
