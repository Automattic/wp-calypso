import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { DomainPriceOverrideOptions } from '../declarative-flow/internals/steps-repository/domain-transfer-domains/use-price-override';
import type { DomainLockResponse } from './use-is-domain-code-valid';

const VERSION = 1;
const HUNDRED_YEAR_DOMAIN_VENDOR = '100-year-domains';

type DomainPriceOverrideResponse = Pick<
	DomainLockResponse,
	'raw_price' | 'sale_cost' | 'currency_code'
>;

type Parameters = {
	domain: string;
	options: DomainPriceOverrideOptions;
};

export function useGetDomainPriceOverride( params: Parameters, queryOptions = {} ) {
	return useQuery( {
		queryKey: [ 'domain-price-override', VERSION, params.domain, params.options.vendor ?? '' ],
		queryFn: async () => {
			const { domain, options } = params;
			try {
				if ( options.vendor !== HUNDRED_YEAR_DOMAIN_VENDOR ) {
					return null;
				}
				const queryParams = Object.entries( options ).reduce(
					( acc, [ key, value ] ) => {
						acc[ key ] = String( value );
						return acc;
					},
					{} as Record< string, string >
				);
				const availability = await wpcomRequest< DomainPriceOverrideResponse >( {
					apiVersion: '1.3',
					path: `/domains/${ encodeURIComponent( domain ) }/is-available`,
					query: new URLSearchParams( queryParams ).toString(),
				} );

				return {
					domain,
					rawPrice: availability.raw_price,
					saleCost: availability.sale_cost,
					currencyCode: availability.currency_code,
				};
			} catch ( error ) {
				return null;
			}
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
		placeholderData: keepPreviousData,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		...queryOptions,
	} );
}
