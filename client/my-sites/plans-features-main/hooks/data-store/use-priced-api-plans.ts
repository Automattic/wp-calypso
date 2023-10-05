import { applyTestFiltersToPlansList } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { getPlan } from 'calypso/state/plans/selectors/plan';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PricedAPIPlan } from '@automattic/data-stores';
import type { UsePricedAPIPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

type Props = {
	planSlugs: PlanSlug[];
};

const useProductIds = ( { planSlugs }: Props ) => {
	return planSlugs.reduce(
		( acc, planSlug ) => {
			const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
			const planProductId = planConstantObj?.getProductId?.() ?? null;

			return {
				...acc,
				[ planSlug ]: planProductId,
			};
		},
		{} as { [ planSlug: string ]: number | null }
	);
};

/*
 * API plans will be ported to data store and be queried from there
 */
const usePricedAPIPlans: UsePricedAPIPlans = ( { planSlugs }: Props ) => {
	const productIds = useProductIds( { planSlugs } );

	return useSelector( ( state ) => {
		return planSlugs.reduce(
			( acc, planSlug ) => {
				const productId = productIds[ planSlug ];
				return {
					...acc,
					[ planSlug ]: null !== productId ? getPlan( state, productId ) : null,
				};
			},
			{} as { [ planSlug: string ]: PricedAPIPlan | null | undefined }
		);
	} );
};

export default usePricedAPIPlans;
