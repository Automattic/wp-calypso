import { keepPreviousData, useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { DomainPriceOverrideOptions } from '../declarative-flow/internals/steps-repository/domain-transfer-domains/use-price-override';

const VERSION = 1;

type DomainLockResponse = {
	transfer_restriction_status?: string;
	transfer_eligible_date?: any;
	term_maximum_in_years?: number;
	admin_email?: string;
	creation_date?: string;
	registrar?: string;
	registrar_iana_id?: string;
	privacy?: boolean;
	unlocked: boolean | null | undefined;
	in_redemption?: boolean;
	status: string;
	transferrability?: string;
	raw_price?: number;
	sale_cost?: number;
	currency_code?: string;
	tld?: string;
	is_price_limit_exceeded?: boolean;
	cannot_transfer_due_to_unsupported_premium_tld?: boolean;
};

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
				if ( options.vendor !== '100-year-domains' ) {
					return null;
				}
				const queryParams = Object.entries( options ).reduce(
					( acc, [ key, value ] ) => {
						acc[ key ] = String( value );
						return acc;
					},
					{} as Record< string, string >
				);
				const availability = await wpcomRequest< DomainLockResponse >( {
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
