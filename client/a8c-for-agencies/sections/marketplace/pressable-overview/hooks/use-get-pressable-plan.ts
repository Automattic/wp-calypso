import { useCallback } from 'react';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';

export type PressablePlan = {
	slug: string;
	install: number;
	visits: number;
	storage: number;
	category: string;
	worker?: number;
	unit?: string;
};

export default function useGetPressablePlan() {
	const { data: products } = useProductsQuery( false, false, true ); // Query always from the new Endpoint

	return useCallback(
		( slug: string ): PressablePlan => {
			const match = products?.find( ( product ) => product.slug === slug );

			if ( match ) {
				return {
					slug: match.slug,
					install: match?.metadata?.sites ?? 0,
					visits: match?.metadata?.visits ?? 0,
					storage: match?.metadata?.storage ?? 0,
					worker: match?.metadata?.php_worker_count ?? 0,
					category: match?.metadata?.category ?? '',
				};
			}

			return {
				slug: '',
				install: 0,
				visits: 0,
				storage: 0,
				category: '',
				worker: 0,
			};
		},
		[ products ]
	);
}
