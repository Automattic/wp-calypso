import { useMemo } from 'react';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import getPressablePlan from '../lib/get-pressable-plan';

type Props = {
	plans: APIProductFamilyProduct[];
};

export default function useExistingPressablePlan( { plans }: Props ) {
	const { data, isSuccess: isReady } = useFetchLicenseCounts();

	return useMemo( () => {
		const pressablePlans = Object.keys( data?.products ?? {} ).filter( ( slug ) =>
			slug.startsWith( 'pressable-' )
		);

		const existingPlan = pressablePlans.find( ( slug ) => {
			return data?.products?.[ slug ]?.not_revoked > 0;
		} );

		return {
			existingPlan: plans.find( ( plan ) => plan.slug === existingPlan ) ?? null,
			pressablePlan: existingPlan ? getPressablePlan( existingPlan ) : null,
			isReady,
		};
	}, [ data?.products, isReady, plans ] );
}
