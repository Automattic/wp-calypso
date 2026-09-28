import { activeAgencyQuery, agencyProductsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
	findAgencyPressablePlan,
	getPressableLicenses,
	getPressableOwnershipType,
	getPressableProducts,
	pressableLicensesQuery,
} from './hosting/lib/pressable-products';

/**
 * The Pressable plan the agency bought for itself, with the catalog and
 * licenses it was found in. The Hosting page and the cart both need it: the
 * introductory price only applies to agencies without a plan.
 */
export function useAgencyPressablePlan() {
	const { data: agency } = useQuery( activeAgencyQuery() );
	const agencyId = agency?.id ?? 0;

	const { data: allProducts } = useQuery( agencyProductsQuery( agencyId ) );
	const { data: licenses, isFetched } = useQuery( {
		...pressableLicensesQuery( agencyId ),
		enabled: agencyId > 0,
	} );

	const products = useMemo( () => getPressableProducts( allProducts ?? [] ), [ allProducts ] );
	const pressableLicenses = useMemo( () => getPressableLicenses( licenses ?? [] ), [ licenses ] );
	const plan = useMemo(
		() => findAgencyPressablePlan( pressableLicenses, products ),
		[ pressableLicenses, products ]
	);

	return {
		plan,
		products,
		licenses: pressableLicenses,
		ownership: getPressableOwnershipType( agency ),
		isReady: isFetched,
	};
}
