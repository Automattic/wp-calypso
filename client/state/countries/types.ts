import type { CountryListItem } from '@automattic/wpcom-checkout';

export interface SmsCountry {
	code: string;
	name: string;
	numeric_code: string;
	country_name: string;
}

export interface CountriesState {
	domains?: CountryListItem[];
	sms?: SmsCountry[];
}
