export interface PhoneNumberPattern {
	match: string;
	replace: string;
	nationalFormat?: string;
	leadingDigitPattern?: string;
}

export interface CountryData {
	isoCode: string;
	dialCode: string;
	regionCode?: string;
	countryDialCode?: string;
	nationalPrefix?: string;
	priority?: number;
	patternRegion?: string;
	patterns?: PhoneNumberPattern[];
	internationalPatterns?: PhoneNumberPattern[];
}
