import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import unpackIntroOffer from './lib/unpack-intro-offer';
import useQueryKeysFactory from './lib/use-query-keys-factory';
import type { PricedAPISitePlan, SitePlan } from '../types';

export interface SitePlansIndex {
	[ planSlug: string ]: SitePlan;
}
interface PricedAPISitePlansIndex {
	[ productId: number ]: PricedAPISitePlan;
}

interface Props {
	siteId?: string | number | null;
}

/**
 * Plans from `/sites/[siteId]/plans` endpoint, transformed into a map of planSlug => SitePlan
 * - Plans from `/sites/[siteId]/plans`, unlike `/plans`, are returned indexed by product_id, and do not include that in the plan's payload.
 * - UI works with product/plan slugs everywhere, so returned index is transformed to be keyed by product_slug
 * - The generic T allows to define generic select functions that can be used to select a subset of the data
 */
function useSitePlans( { siteId }: Props ) {
	const queryKeys = useQueryKeysFactory();

	return useQuery( {
		queryKey: queryKeys.sitePlans( siteId ),
		queryFn: async (): Promise< SitePlansIndex > => {
			const data: PricedAPISitePlansIndex = await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/plans`,
				apiVersion: '1.3',
			} );

			return Object.fromEntries(
				Object.keys( data ).map( ( productId ) => {
					const plan = data[ Number( productId ) ];

					return [
						plan.product_slug,
						{
							planSlug: plan.product_slug,
							productSlug: plan.product_slug,
							productId: Number( productId ),
							introOffer: unpackIntroOffer( plan ),
							expiry: plan.expiry,
							currentPlan: plan.current_plan,
							purchaseId: plan.id ? Number( plan.id ) : undefined,
						},
					];
				} )
			);
		},
		staleTime: 1000 * 60 * 5, // 5 minutes
		enabled: !! siteId,
	} );
}

export default useSitePlans;
