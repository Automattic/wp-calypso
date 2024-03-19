/**
 * Sum type over ISO 4217 currency codes.
 *
 *   @examples 'USD', 'JPY', 'BRL'
 */
export type CurrencyCode =
	| 'AED'
	| 'AFN'
	| 'ALL'
	| 'AMD'
	| 'ANG'
	| 'AOA'
	| 'ARS'
	| 'AUD'
	| 'AWG'
	| 'AZN'
	| 'BAM'
	| 'BBD'
	| 'BDT'
	| 'BGN'
	| 'BHD'
	| 'BIF'
	| 'BMD'
	| 'BND'
	| 'BOB'
	| 'BRL'
	| 'BSD'
	| 'BTC'
	| 'BTN'
	| 'BWP'
	| 'BYN'
	| 'BZD'
	| 'CAD'
	| 'CDF'
	| 'CHF'
	| 'CLF'
	| 'CLP'
	| 'CNH'
	| 'CNY'
	| 'COP'
	| 'CRC'
	| 'CUC'
	| 'CUP'
	| 'CVE'
	| 'CZK'
	| 'DJF'
	| 'DKK'
	| 'DOP'
	| 'DZD'
	| 'EGP'
	| 'ERN'
	| 'ETB'
	| 'EUR'
	| 'FJD'
	| 'FKP'
	| 'GBP'
	| 'GEL'
	| 'GGP'
	| 'GHS'
	| 'GIP'
	| 'GMD'
	| 'GNF'
	| 'GTQ'
	| 'GYD'
	| 'HKD'
	| 'HNL'
	| 'HRK'
	| 'HTG'
	| 'HUF'
	| 'IDR'
	| 'ILS'
	| 'IMP'
	| 'INR'
	| 'IQD'
	| 'IRR'
	| 'ISK'
	| 'JEP'
	| 'JMD'
	| 'JOD'
	| 'JPY'
	| 'KES'
	| 'KGS'
	| 'KHR'
	| 'KID'
	| 'KMF'
	| 'KPW'
	| 'KRW'
	| 'KWD'
	| 'KYD'
	| 'KZT'
	| 'LAK'
	| 'LBP'
	| 'LKR'
	| 'LRD'
	| 'LSL'
	| 'LYD'
	| 'MAD'
	| 'MDL'
	| 'MGA'
	| 'MKD'
	| 'MMK'
	| 'MNT'
	| 'MOP'
	| 'MRO'
	| 'MRU'
	| 'MUR'
	| 'MVR'
	| 'MWK'
	| 'MXN'
	| 'MYR'
	| 'MZN'
	| 'NAD'
	| 'NGN'
	| 'NIO'
	| 'NOK'
	| 'NPR'
	| 'NZD'
	| 'OMR'
	| 'PAB'
	| 'PEN'
	| 'PGK'
	| 'PHP'
	| 'PKR'
	| 'PLN'
	| 'PRB'
	| 'PYG'
	| 'QAR'
	| 'RON'
	| 'RSD'
	| 'RUB'
	| 'RWF'
	| 'SAR'
	| 'SBD'
	| 'SCR'
	| 'SDG'
	| 'SEK'
	| 'SGD'
	| 'SHP'
	| 'SLL'
	| 'SLS'
	| 'SOS'
	| 'SRD'
	| 'SSP'
	| 'STD'
	| 'STN'
	| 'SVC'
	| 'SYP'
	| 'SZL'
	| 'THB'
	| 'TJS'
	| 'TMT'
	| 'TND'
	| 'TOP'
	| 'TRY'
	| 'TTD'
	| 'TVD'
	| 'TWD'
	| 'TZS'
	| 'UAH'
	| 'UGX'
	| 'USD'
	| 'UYU'
	| 'UYW'
	| 'UZS'
	| 'VEF'
	| 'VES'
	| 'VND'
	| 'VUV'
	| 'WST'
	| 'XAF'
	| 'XCD'
	| 'XOF'
	| 'XPF'
	| 'YER'
	| 'ZAR'
	| 'ZMW';

/**
 * Number of minor units per major unit. When expressed as a power
 * of 10 this is called the exponent. Some currencies have non-integer
 * exponents (e.g. Madagascar) so we return the raw number instead.
 * Data comes from ISO 4217.
 *
 * @see https://www.iso.org/iso-4217-currency-codes.html
 *
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns Number of minor currency units per major unit
 */
export function minorUnitsPerMajorUnit( currencyCode: CurrencyCode ): 1 | 5 | 100 | 1000 | 10000 {
	switch ( currencyCode ) {
		// Let's catch the common cases first
		case 'AUD': // Australian dollar
		case 'BRL': // Brazilian real
		case 'CAD': // Canadian dollar
		case 'USD': // US dollar
			return 100;

		case 'BIF': // Burundian franc
		case 'CLP': // Chilean peso
		case 'DJF': // Djibouti franc
		case 'GNF': // Guinean franc
		case 'ISK': // Icelandic króna
		case 'JPY': // Yen
		case 'KMF': // Comorian franc
		case 'KRW': // Won
		case 'PYG': // Guarani
		case 'RWF': // Rwanda franc
		case 'UGX': // Uganda shilling
		case 'UYU': // Uruguay peso en unidades indexadas
		case 'VUV': // Vatu
		case 'VND': // Vietnamese dong
		case 'XAF': // CFA Franc BEAC
		case 'XOF': // CFA Franc BCEAO
		case 'XPF': // CFP Franc
			return 1;

		case 'MGA': // Malagasy ariary
		case 'MRU': // Mauritanian ouguiya
			return 5;

		case 'BHD': // Bahraini dinar
		case 'IQD': // Iraqi dinar
		case 'JOD': // Jordanian dinar
		case 'KWD': // Kuwaiti dinar
		case 'LYD': // Libyan dinar
		case 'OMR': // Rial Omani
		case 'TND': // Tunisian dinar
			return 1000;

		case 'CLF': // Unidad de Fomento
		case 'UYW': // Unidad Previsional
			return 10000;

		default:
			return 100;
	}
}

/**
 * Detects currencies with globally unique symbols. These are
 * nice because they do not require disambiguation.
 *
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns
 *   True if the currency's symbol is unique
 */
export function hasUniqueLocalSymbol( currencyCode: CurrencyCode ): boolean {
	const currenciesWithUniqueSymbols: CurrencyCode[] = [
		'AED',
		'AFN',
		'ALL',
		'AMD',
		'ANG',
		'AOA',
		'AWG',
		'AZN',
		'BAM',
		'BDT',
		'BGN',
		'BHD',
		'BOB',
		'BRL',
		'BTN',
		'BWP',
		'BYN',
		'CHF',
		'CNY',
		'CRC',
		'CZK',
		'DZD',
		'EGP',
		'ERN',
		'ETB',
		'EUR',
		'GEL',
		'GHS',
		'GMD',
		'GTQ',
		'HNL',
		'HRK',
		'HTG',
		'HUF',
		'IDR',
		'ILS',
		'INR',
		'IQD',
		'IRR',
		'JOD',
		'JPY',
		'KGS',
		'KHR',
		'KWD',
		'KZT',
		'LAK',
		'LBP',
		'LKR',
		'LSL',
		'LYD',
		'MAD',
		'MDL',
		'MGA',
		'MKD',
		'MMK',
		'MNT',
		'MOP',
		'MRU',
		'MVR',
		'MWK',
		'MYR',
		'MZN',
		'NGN',
		'NIO',
		'NPR',
		'OMR',
		'PAB',
		'PEN',
		'PGK',
		'PHP',
		'PLN',
		'PRB',
		'PYG',
		'QAR',
		'RON',
		'RSD',
		'RUB',
		'SAR',
		'SDG',
		'SLL',
		'SLS',
		'STN',
		'SYP',
		'SZL',
		'THB',
		'TJS',
		'TMT',
		'TND',
		'TOP',
		'TRY',
		'UAH',
		'UZS',
		'VES',
		'VND',
		'VUV',
		'WST',
		'XPF',
		'YER',
		'ZAR',
		'ZMW',
	];

	return currenciesWithUniqueSymbols.includes( currencyCode );
}
