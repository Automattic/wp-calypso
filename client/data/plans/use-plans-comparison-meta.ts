import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type PlansComparisonMetaData = {
	currency: string;
	bottom_theme_price: number;
	bottom_theme_price_display: string;
};

export default function usePlansComparisonMeta( currency: string ) {
	return useQuery< unknown, unknown, PlansComparisonMetaData >( {
		queryKey: [ 'plans-comparison-meta', currency ],
		queryFn: () =>
			wpcom.req.get(
				{
					path: '/plans-comparison-meta',
				},
				{ apiVersion: '1.2' }
			),
	} );
}
