import { useMemo } from 'react';
import useFetchLicenseCounts from 'calypso/a8c-for-agencies/data/purchases/use-fetch-license-counts';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';

type Props = {
	plans: APIProductFamilyProduct[];
};

export default function useExistingPressablePlan( { plans }: Props ) {
	const { data, isSuccess: isReady } = useFetchLicenseCounts();

	return useMemo( () => {
		const pressablePlans = Object.keys( data?.products ?? {} ).filter( ( slug ) =>
			slug.startsWith( 'pressable-wp' )
		);

		const existingPlan = pressablePlans.find( ( slug ) => {
			return data?.products?.[ slug ]?.not_revoked > 0;
		} );

		return {
			existingPlan: plans.find( ( plan ) => plan.slug === existingPlan ) ?? null,
			isReady,
		};
	}, [ data?.products, isReady, plans ] );
}
