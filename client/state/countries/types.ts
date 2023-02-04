import type { CountryListItem } from '@automattic/wpcom-checkout';

export interface CountriesState {
	domains: CountryListItem[] | undefined;
	payments: CountryListItem[] | undefined;
	sms: CountryListItem[] | undefined;
	woocommerce: CountryListItem[] | undefined;
}
