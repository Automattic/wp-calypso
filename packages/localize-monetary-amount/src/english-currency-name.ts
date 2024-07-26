/**
 * Internal dependencies
 */
import { CurrencyCode } from './currency-code';

/**
 * Human readable name (in English) for a given currency code.
 * For e.g. tooltips on the frontend.
 *
 * @throws on unrecognized codes
 *
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns
 *   Human readable currency name in English
 */
export function englishCurrencyName( currencyCode: CurrencyCode ): string {
	switch ( currencyCode ) {
		case 'AED':
			return 'United Arab Emirates Dirham';
		case 'AFN':
			return 'Afghan Afghani';
		case 'ALL':
			return 'Albanian Lek';
		case 'AMD':
			return 'Armenian Dram';
		case 'ANG':
			return 'Netherlands Antillean Guilder';
		case 'AOA':
			return 'Angolan Kwanza';
		case 'ARS':
			return 'Argentine Peso';
		case 'AUD':
			return 'Australian Dollar';
		case 'AWG':
			return 'Aruban Florin';
		case 'AZN':
			return 'Azerbaijani Manat';
		case 'BAM':
			return 'Bosnia-Herzegovina Convertible Mark';
		case 'BBD':
			return 'Barbadian Dollar';
		case 'BDT':
			return 'Bangladeshi Taka';
		case 'BGN':
			return 'Bulgarian Lev';
		case 'BHD':
			return 'Bahraini Dinar';
		case 'BIF':
			return 'Burundian Franc';
		case 'BMD':
			return 'Bermudan Dollar';
		case 'BND':
			return 'Brunei Dollar';
		case 'BOB':
			return 'Bolivian Boliviano';
		case 'BRL':
			return 'Brazilian Real';
		case 'BSD':
			return 'Bahamian Dollar';
		case 'BTC':
			return 'Bitcoin';
		case 'BTN':
			return 'Bhutanese Ngultrum';
		case 'BWP':
			return 'Botswanan Pula';
		case 'BYN':
			return 'Belarusian Ruble';
		case 'BZD':
			return 'Belize Dollar';
		case 'CAD':
			return 'Canadian Dollar';
		case 'CDF':
			return 'Congolese Franc';
		case 'CHF':
			return 'Swiss Franc';
		case 'CLF':
			return 'Chilean Unit of Account (UF)';
		case 'CLP':
			return 'Chilean Peso';
		case 'CNH':
			return 'Chinese Yuan (Offshore)';
		case 'CNY':
			return 'Chinese Yuan';
		case 'COP':
			return 'Colombian Peso';
		case 'CRC':
			return 'Costa Rican Colón';
		case 'CUC':
			return 'Cuban Convertible Peso';
		case 'CUP':
			return 'Cuban Peso';
		case 'CVE':
			return 'Cape Verdean Escudo';
		case 'CZK':
			return 'Czech Republic Koruna';
		case 'DJF':
			return 'Djiboutian Franc';
		case 'DKK':
			return 'Danish Krone';
		case 'DOP':
			return 'Dominican Peso';
		case 'DZD':
			return 'Algerian Dinar';
		case 'EGP':
			return 'Egyptian Pound';
		case 'ERN':
			return 'Eritrean Nakfa';
		case 'ETB':
			return 'Ethiopian Birr';
		case 'EUR':
			return 'Euro';
		case 'FJD':
			return 'Fijian Dollar';
		case 'FKP':
			return 'Falkland Islands Pound';
		case 'GBP':
			return 'British Pound Sterling';
		case 'GEL':
			return 'Georgian Lari';
		case 'GGP':
			return 'Guernsey Pound';
		case 'GHS':
			return 'Ghanaian Cedi';
		case 'GIP':
			return 'Gibraltar Pound';
		case 'GMD':
			return 'Gambian Dalasi';
		case 'GNF':
			return 'Guinean Franc';
		case 'GTQ':
			return 'Guatemalan Quetzal';
		case 'GYD':
			return 'Guyanaese Dollar';
		case 'HKD':
			return 'Hong Kong Dollar';
		case 'HNL':
			return 'Honduran Lempira';
		case 'HRK':
			return 'Croatian Kuna';
		case 'HTG':
			return 'Haitian Gourde';
		case 'HUF':
			return 'Hungarian Forint';
		case 'IDR':
			return 'Indonesian Rupiah';
		case 'ILS':
			return 'Israeli New Sheqel';
		case 'IMP':
			return 'Manx pound';
		case 'INR':
			return 'Indian Rupee';
		case 'IQD':
			return 'Iraqi Dinar';
		case 'IRR':
			return 'Iranian Rial';
		case 'ISK':
			return 'Icelandic Króna';
		case 'JEP':
			return 'Jersey Pound';
		case 'JMD':
			return 'Jamaican Dollar';
		case 'JOD':
			return 'Jordanian Dinar';
		case 'JPY':
			return 'Japanese Yen';
		case 'KES':
			return 'Kenyan Shilling';
		case 'KGS':
			return 'Kyrgystani Som';
		case 'KHR':
			return 'Cambodian Riel';
		case 'KMF':
			return 'Comorian Franc';
		case 'KPW':
			return 'North Korean Won';
		case 'KRW':
			return 'South Korean Won';
		case 'KWD':
			return 'Kuwaiti Dinar';
		case 'KYD':
			return 'Cayman Islands Dollar';
		case 'KZT':
			return 'Kazakhstani Tenge';
		case 'LAK':
			return 'Laotian Kip';
		case 'LBP':
			return 'Lebanese Pound';
		case 'LKR':
			return 'Sri Lankan Rupee';
		case 'LRD':
			return 'Liberian Dollar';
		case 'LSL':
			return 'Lesotho Loti';
		case 'LYD':
			return 'Libyan Dinar';
		case 'MAD':
			return 'Moroccan Dirham';
		case 'MDL':
			return 'Moldovan Leu';
		case 'MGA':
			return 'Malagasy Ariary';
		case 'MKD':
			return 'Macedonian Denar';
		case 'MMK':
			return 'Myanma Kyat';
		case 'MNT':
			return 'Mongolian Tugrik';
		case 'MOP':
			return 'Macanese Pataca';
		case 'MRO':
			return 'Mauritanian Ouguiya';
		case 'MUR':
			return 'Mauritian Rupee';
		case 'MVR':
			return 'Maldivian Rufiyaa';
		case 'MWK':
			return 'Malawian Kwacha';
		case 'MXN':
			return 'Mexican Peso';
		case 'MYR':
			return 'Malaysian Ringgit';
		case 'MZN':
			return 'Mozambican Metical';
		case 'NAD':
			return 'Namibian Dollar';
		case 'NGN':
			return 'Nigerian Naira';
		case 'NIO':
			return 'Nicaraguan Córdoba';
		case 'NOK':
			return 'Norwegian Krone';
		case 'NPR':
			return 'Nepalese Rupee';
		case 'NZD':
			return 'New Zealand Dollar';
		case 'OMR':
			return 'Omani Rial';
		case 'PAB':
			return 'Panamanian Balboa';
		case 'PEN':
			return 'Peruvian Nuevo Sol';
		case 'PGK':
			return 'Papua New Guinean Kina';
		case 'PHP':
			return 'Philippine Peso';
		case 'PKR':
			return 'Pakistani Rupee';
		case 'PLN':
			return 'Polish Zloty';
		case 'PYG':
			return 'Paraguayan Guarani';
		case 'QAR':
			return 'Qatari Rial';
		case 'RON':
			return 'Romanian Leu';
		case 'RSD':
			return 'Serbian Dinar';
		case 'RUB':
			return 'Russian Ruble';
		case 'RWF':
			return 'Rwandan Franc';
		case 'SAR':
			return 'Saudi Riyal';
		case 'SBD':
			return 'Solomon Islands Dollar';
		case 'SCR':
			return 'Seychellois Rupee';
		case 'SDG':
			return 'Sudanese Pound';
		case 'SEK':
			return 'Swedish Krona';
		case 'SGD':
			return 'Singapore Dollar';
		case 'SHP':
			return 'Saint Helena Pound';
		case 'SLL':
			return 'Sierra Leonean Leone';
		case 'SOS':
			return 'Somali Shilling';
		case 'SRD':
			return 'Surinamese Dollar';
		case 'SSP':
			return 'South Sudanese Pound';
		case 'STD':
			return 'São Tomé and Príncipe Dobra';
		case 'SVC':
			return 'Salvadoran Colón';
		case 'SYP':
			return 'Syrian Pound';
		case 'SZL':
			return 'Swazi Lilangeni';
		case 'THB':
			return 'Thai Baht';
		case 'TJS':
			return 'Tajikistani Somoni';
		case 'TMT':
			return 'Turkmenistani Manat';
		case 'TND':
			return 'Tunisian Dinar';
		case 'TOP':
			return 'Tongan Paanga';
		case 'TRY':
			return 'Turkish Lira';
		case 'TTD':
			return 'Trinidad and Tobago Dollar';
		case 'TWD':
			return 'New Taiwan Dollar';
		case 'TZS':
			return 'Tanzanian Shilling';
		case 'UAH':
			return 'Ukrainian Hryvnia';
		case 'UGX':
			return 'Ugandan Shilling';
		case 'USD':
			return 'United States Dollar';
		case 'UYU':
			return 'Uruguayan Peso';
		case 'UZS':
			return 'Uzbekistan Som';
		case 'VEF':
			return 'Venezuelan Bolívar Fuerte';
		case 'VND':
			return 'Vietnamese Dong';
		case 'VUV':
			return 'Vanuatu Vatu';
		case 'WST':
			return 'Samoan Tala';
		case 'XAF':
			return 'CFA Franc BEAC';
		case 'XCD':
			return 'East Caribbean Dollar';
		case 'XOF':
			return 'CFA Franc BCEAO';
		case 'XPF':
			return 'CFP Franc';
		case 'YER':
			return 'Yemeni Rial';
		case 'ZAR':
			return 'South African Rand';
		case 'ZMW':
			return 'Zambian Kwacha';

		default:
			throw new Error( `Currency not supported: ${ currencyCode }` );
	}
}
