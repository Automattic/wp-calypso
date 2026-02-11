import { useCallback } from 'react';
import useProductAndPlans from '../../hooks/use-product-and-plans';
import {
	PLAN_CATEGORY_PREMIUM,
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_STANDARD,
} from '../constants';

export type PressablePlan = {
	slug: string;
	install: number;
	visits: number;
	storage: number;
	category: string;
	worker?: number;
};

const getPlanCategory = ( slug: string ) => {
	if ( slug.startsWith( 'pressable-signature-' ) ) {
		return PLAN_CATEGORY_SIGNATURE;
	}
	if ( slug.startsWith( 'pressable-premium-' ) ) {
		return PLAN_CATEGORY_PREMIUM;
	}
	return PLAN_CATEGORY_STANDARD;
};

export default function useGetPressablePlanInfo() {
	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	return useCallback(
		( slug: string ): PressablePlan | null => {
			const pressablePlan = pressablePlans.find( ( plan ) => plan.slug === slug );

			if ( ! pressablePlan ) {
				return null;
			}

			return {
				slug: pressablePlan.slug,
				install: ( pressablePlan.metadata?.sites as number ) ?? 0,
				visits: ( pressablePlan.metadata?.visits as number ) ?? 0,
				storage: ( pressablePlan.metadata?.storage as number ) ?? 0,
				worker: ( pressablePlan.metadata?.php_worker_count as number ) ?? 0,
				category: getPlanCategory( pressablePlan.slug ),
			};
		},
		[ pressablePlans ]
	);
}
