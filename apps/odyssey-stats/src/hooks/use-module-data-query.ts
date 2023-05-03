import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type Module = 'anti-spam' | 'protect' | 'vaultpress' | 'monitor' | 'stats' | 'verification-tools';

function queryModuleData( module: Module ): Promise< number | string > {
	// More information about the endpoint: https://github.com/Automattic/jetpack/blob/32acf7023bb76332947f4929863d212fdf3b890a/projects/plugins/jetpack/_inc/lib/core-api/class.jetpack-core-api-module-endpoints.php#L1393
	return wpcom.req
		.get( {
			method: 'GET',
			// Ensure you add the apiNamespace to be able to access Jetpack's `jetpack/v4` endpoints, otherwise it's all defaulted to `jetpack/v4/stats-app`.
			apiNamespace: 'jetpack/v4',
			path: `/module/${ module }/data`,
		} )
		.catch( ( error ) => {
			if ( error?.code === 'not_active' ) {
				// Convert protect 404 error to normal not_active error.
				throw new Error( error.code );
			}
			throw error;
		} )
		.then( ( response ) => {
			// Proetect return false if the module is enabled but number of blocked attempts is 0.
			if ( response === 'false' || response === false ) {
				return 0;
			}
			if ( isFinite( response ) ) {
				return parseInt( response );
			}
			throw new Error( response );
		} );
}

export default function useModuleDataQuery( module: Module ) {
	return useQuery( [ 'stats-widget', 'module-data', module ], () => queryModuleData( module ), {
		staleTime: 5 * 60 * 1000,
		// If the module is not active, we don't want to retry the query.
		retry: false,
		retryOnMount: false,
		refetchOnWindowFocus: false,
	} );
}
