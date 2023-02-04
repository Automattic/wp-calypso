import type { CountryListItem } from '@automattic/wpcom-checkout';

// Example key: 'US:TX'
export type WooCountryKey = string;

// Example value: "United States (US) — Texas"
export type WooCountryValue = string;

export type WooCountryList = Record< WooCountryKey, WooCountryValue >;

export interface CountriesState {
	domains: CountryListItem[] | undefined;
	payments: CountryListItem[] | undefined;
	sms: CountryListItem[] | undefined;
	woocommerce: WooCountryList | undefined;
}
