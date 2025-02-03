import { doesStringResembleDomain } from '@automattic/onboarding';
import { useI18n } from '@wordpress/react-i18n';
import { useDebounce } from 'use-debounce';
import { useGetDomainPriceOverride } from 'calypso/landing/stepper/hooks/use-get-domain-price-override';

type Vendor = '100-year-domains';
export type DomainPriceOverrideOptions = {
	vendor?: Vendor;
};

export function usePriceOverride( domain: string, options: DomainPriceOverrideOptions = {} ) {
	const { __ } = useI18n();

	const [ domainDebounced ] = useDebounce( domain, 500 );

	const hasGoodDomain = doesStringResembleDomain( domainDebounced );

	const isDebouncing = domainDebounced !== domain;

	const { data: priceOverrideResult, isFetching: isLoading } = useGetDomainPriceOverride(
		{
			domain: domainDebounced,
			options,
		},
		{
			enabled: Boolean( hasGoodDomain ),
			retry: false,
		}
	);

	if ( ! hasGoodDomain ) {
		return {
			valid: false,
			loading: false,
			message: __( 'Please enter a valid domain name.' ),
		};
	}

	if ( isLoading || isDebouncing ) {
		return {
			valid: false,
			loading: true,
		};
	}

	if ( ! priceOverrideResult?.rawPrice ) {
		return {
			valid: false,
			loading: false,
		};
	}

	return {
		valid: true,
		loading: false,
		rawPrice: priceOverrideResult.rawPrice,
	};
}
