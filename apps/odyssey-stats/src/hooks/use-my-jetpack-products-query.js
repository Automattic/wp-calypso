import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

function queryMyJetpackProducts() {
	// More information about the endpoint: https://github.com/Automattic/jetpack/blob/32acf7023bb76332947f4929863d212fdf3b890a/projects/plugins/jetpack/_inc/lib/core-api/class.jetpack-core-api-module-endpoints.php#L1393
	return wpcom.req.get( {
		method: 'GET',
		// Ensure you add the apiNamespace to be able to access Jetpack's `jetpack/v4` endpoints, otherwise it's all defaulted to `jetpack/v4/stats-app`.
		apiNamespace: 'my-jetpack/v1',
		path: '/site/products',
	} );
}

export default function useMyJetpackProductsQuery() {
	return useQuery( [ 'stats-widget', 'my-jetpack', 'site-products' ], queryMyJetpackProducts, {
		select: ( data ) => data,
		staleTime: 5 * 60 * 1000,
	} );
}
