import { useQuery } from '@tanstack/react-query';
import { useCallback } from '@wordpress/element';
import wpcomRequest from 'wpcom-proxy-request';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPISitePlan } from '../types';

interface PricedAPISitePlansIndex {
	[ planSlug: string ]: PricedAPISitePlan;
}
interface PricedAPISitePlansIndexServer {
	[ productId: number ]: Omit< PricedAPISitePlan, 'product_id' >;
}

interface Props {
	siteId?: string | number | null;
}

/**
 * Get all plans for a site, indexed by product_slug
 * - Plans from `/sites/[siteId]/plans`, unlike `/plans`, are returned indexed by product_id, and do not inlcude that in the plan's payload.
 * - UI works with product/plan slugs everywhere, so returned index is transformed to be keyed by product_slug
 */
function usePricedAPISitePlans( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery< PricedAPISitePlansIndexServer, Error, PricedAPISitePlansIndex >( {
		queryKey: queryKeys.sitePlans( siteId ),
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
			} ),
		select: useCallback( ( data: PricedAPISitePlansIndexServer ) => {
			return Object.keys( data ).reduce< PricedAPISitePlansIndex >( ( acc, productId ) => {
				const plan = data[ Number( productId ) ];
				return {
					...acc,
					[ plan.product_slug ]: {
						...plan,
						product_id: Number( productId ),
					},
				};
			}, {} );
		}, [] ),
		refetchOnWindowFocus: false,
		staleTime: 1000 * 60 * 3, // 3 minutes
		enabled: !! siteId,
	} );
}

export default usePricedAPISitePlans;
