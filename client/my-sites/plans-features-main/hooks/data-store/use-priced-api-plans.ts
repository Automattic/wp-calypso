import { applyTestFiltersToPlansList } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { getPlan, getPlans } from 'calypso/state/plans/selectors/plan';
import type { PlanSlug } from '@automattic/calypso-products';
import type { PricedAPIPlan } from '@automattic/data-stores';
import type { UsePricedAPIPlans } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

type Props = {
	planSlugs: PlanSlug[];
};

const useProductIds = ( { planSlugs }: Props ) => {
	return useMemo(
		() =>
			planSlugs.reduce(
				( acc, planSlug ) => {
					const planConstantObj = applyTestFiltersToPlansList( planSlug, undefined );
					const planProductId = planConstantObj?.getProductId?.() ?? null;

					return {
						...acc,
						[ planSlug ]: planProductId,
					};
				},
				{} as { [ planSlug: string ]: number | null }
			),
		[ planSlugs ]
	);
};

const getPricedAPIPlans = createSelector(
	( state, planSlugs: PlanSlug[], productIds: { [ planSlug: string ]: number | null } ) =>
		planSlugs.reduce(
			( acc, planSlug ) => {
				const productId = productIds[ planSlug ];
				return {
					...acc,
					[ planSlug ]: null !== productId ? getPlan( state, productId ) : null,
				};
			},
			{} as { [ planSlug: string ]: PricedAPIPlan | null | undefined }
		),
	( state, planSlugs: PlanSlug[], productIds ) => [ getPlans( state ), planSlugs, productIds ]
);

/*
 * API plans will be ported to data store and be queried from there
 */
const usePricedAPIPlans: UsePricedAPIPlans = ( { planSlugs }: Props ) => {
	const productIds = useProductIds( { planSlugs } );
	return useSelector( ( state ) => getPricedAPIPlans( state, planSlugs, productIds ) );
};

export default usePricedAPIPlans;
