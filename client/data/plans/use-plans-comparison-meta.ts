import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

export type PlansComparisonMetaData = {
	currency: string;
	bottom_theme_price: number;
	bottom_theme_price_display: string;
	no_ads_monthly_cost: number;
	no_ads_monthly_cost_display: string;
};

export default function usePlansComparisonMeta( currency: string ) {
	return useQuery< unknown, unknown, PlansComparisonMetaData >(
		[ 'plans-comparison-meta', currency ],
		() =>
			wpcom.req.get(
				{
					path: '/plans-comparison-meta',
				},
				{ apiVersion: '1.2' }
			)
	);
}
