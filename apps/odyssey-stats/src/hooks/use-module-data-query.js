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
		// Verify that the data is an integer. Otherwise, it is `N/A` or `not_active`.
		select: ( data ) => ( isNaN( data ) ? null : parseInt( data ) ),
		staleTime: 5 * 60 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
	} );
}
