import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

function queryModuleData( module ) {
	// More information about the endpoint: https://github.com/Automattic/jetpack/blob/32acf7023bb76332947f4929863d212fdf3b890a/projects/plugins/jetpack/_inc/lib/core-api/class.jetpack-core-api-module-endpoints.php#L1393
	return wpcom.req.get( {
		method: 'GET',
		// Ensure you add the apiNamespace to be able to access Jetpack's `jetpack/v4` endpoints, otherwise it's all defaulted to `jetpack/v4/stats-app`.
		apiNamespace: 'jetpack/v4',
		path: `/module/${ module }/data`,
	} );
}

export default function useModuleDataQuery( module ) {
	return useQuery( [ 'stats-widget', 'module-data', module ], () => queryModuleData( module ), {
		select: ( data ) => {
			switch ( module ) {
				case 'protect':
					// The API for protect returns `false` when the counter is 0.
					//                     returns 404 error, when the module is not active.
					if ( data === 'false' || data === false ) {
						return 0;
					}

				// For Akismet, the API returns an integer if module is active.
				// Otherwise, it returns `not_active`, `not_installed` or `invalid_key`.

				default:
					return data;
			}
		},
		staleTime: 5 * 60 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
	} );
}
