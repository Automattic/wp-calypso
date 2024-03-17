import type { CountryListItem } from '@automattic/wpcom-checkout';

// Example key: 'US:TX'
export type WooCountryKey = string;

// Example value: "United States (US) — Texas"
export type WooCountryValue = string;

export type WooCountryList = Record< WooCountryKey, WooCountryValue >;

export interface SmsCountry {
	code: string;
	name: string;
	numeric_code: string;
	country_name: string;
}

export interface CountriesState {
	domains?: CountryListItem[];
	sms?: SmsCountry[];
	woocommerce?: WooCountryList;
}
