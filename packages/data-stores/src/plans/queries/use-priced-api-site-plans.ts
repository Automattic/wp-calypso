import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { PricedAPISitePlan } from '../types';

function usePricedAPISitePlans( siteId: string | number | undefined ) {
	return useQuery< PricedAPISitePlan[], Error >( {
		queryKey: [ 'plans', siteId ],
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
			} ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 3, // 3 minutes
		enabled: !! siteId,
	} );
}

export default usePricedAPISitePlans;
