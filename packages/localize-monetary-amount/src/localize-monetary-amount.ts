/**
 * Internal dependencies
 */
import { CurrencyCode, minorUnitsPerMajorUnit, hasUniqueLocalSymbol } from './currency-code';
import {
	CheckedNumber,
	validateInteger,
	NonNegativeInteger,
	Sign,
	signOf,
	absoluteValue,
} from './number';

/**
 * Format a monetary amount according to the custom of a given linguistic
 * and geographic locale.
 *
 *
 * THE PROBLEM
 * ===========
 *
 * Idiomatic formatting of monetary amounts depends on (1) the currency,
 * (2) the user's preferred language, and sometimes (3) the user's location.
 * Several questions have to be answered before rendering an amount as text.
 *
 *   (1) What currency symbol is used?
 *   (2) If the currency symbol is not unique, how is it disambiguated?
 *         (e.g. '$' is severely overloaded.)
 *   (3) What symbol is used for the radix point?
 *         (this is the '.' in '$1.00')
 *   (4) What symbol is used to separate digit groups in large integers?
 *         (this is the ',' in '$1,000')
 *   (5) How are the digits of large integers grouped for readability?
 *         (usually in groups of three, but not always!)
 *   (6) Does the currency symbol appear to the left or the right of the number?
 *         (e.g. rtl languages)
 *
 * Answers to all of these can vary across the world, and getting it right is
 * an important part of localization. Seeing numbers written in an unfamiliar
 * way is bad UX and erodes trust. We can do better!
 *
 *
 * OUR STRATEGY
 * ============
 *
 * At a high level, this code is based on the following assumption: the single
 * most important predictor of a user's preferred currency format is their
 * *language*, possibly supplemented by their *country*, and after that their
 * chosen *currency*. Here's why.
 *
 *     (1) Formatting customs vary by /country/ in general because trade
 *           networks are most connected inside of national boundaries.
 *     (2) However, due to larger network effects (and colonialism) the
 *           customs tend to be the same across countries that share
 *           a dominant /language/, and can differ inside countries
 *           with multiple dominant languages (e.g. Canada or Belgium).
 *     (3) Because of (2), we can't take for granted that knowing what
 *           country a user is currently in tells us what kind of numbers
 *           they expect to see. People move around!
 *     (4) BUT at the same time knowing the language alone is not enough,
 *           because of (1). Some countries which share a language use
 *           different styles (e.g. UK and US).
 *
 * And so the first argument to this function is an ISO 631-1 language code
 * with an optional ISO 3166-1 alpha-2 region code, separated by a hyphen.
 * This tends to be the locale format reported in browsers.
 *
 * The bulk of the implementation is then a giant switch statement on the
 * locale. It's not pretty, but it's the clearest way I can think of to break
 * up the problem. This associates each locale/currency pair to a /schema/,
 * which is a slug representing the localized format.
 *
 * @see https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 * @see https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
 *
 *
 * GLOSSARY
 * ========
 *
 *   * currency symbol
 *       This is the customary unit symbol of the currency, like '$' or '€'.
 *       Note that these may not be unique and so may require disambiguation,
 *       and because currencies are issued by national governments that can
 *       depend on the geo locale. Not to be confused with three letter names
 *       specified in ISO 4217, which are unique. Currencies with unique
 *       symbols are AWESOME.
 *   * major unit
 *       All currencies have a /major unit/; this is "the" unit of the currency.
 *       For USD it's the dollar, for EUR it's the euro, for JPY it's the yen.
 *   * minor unit
 *       Most currencies divide their major unit into some whole number of /minor
 *       units/; e.g. in USD we have 1 dollar == 100 cents. For some currencies
 *       the minor unit is no longer in use due to inflation or devaluation;
 *       this is the case for JPY. In these cases (and JPY is the main one)
 *       we might as well think of the minor unit as the same as the major unit.
 *       Regardless of currency, monetary amounts are formatted as an integer
 *       number of major units with any minor unit remainder as a decimal part.
 *   * exponent
 *       For most currencies the number of minor units per major unit is a
 *       power of ten, either 100 = 10^2 or 1000 = 10^3. In these cases the
 *       power (2 or 3) is called the /exponent/. HOWEVER note that there are
 *       some currencies where the number of minor units per major unit is not
 *       an integer power of 10, so working with the exponent (2 or 3) is harder
 *       than working with the multiple directly (100 or 1000). This code uses
 *       the multiple only.
 *
 *
 * NOTES FOR MAINTAINERS
 * =====================
 *
 * This package will almost certainly require tweaking on a locale-by-locale
 * basis. It's intended that this will happen in two places:
 *
 *   * To adjust formatting for a specific locale and currency:
 *       Look at currencyFormattingSchema(). This is a giant nested switch
 *       statement that governs the format used for a given locale/currency pair.
 *       See also the CurrencyFormat type.
 *   * To add a new format:
 *       Look at localizeCurrencyWithSchema(). This is where a format slug
 *       and amount data get translated to an actual string.
 *
 *
 * FURTHER READING
 * ===============
 *
 * Surprisingly there are no standard documents on localized currency formatting,
 * but the following resources are helpful:
 *
 *     https://publications.europa.eu/code/en/en-370303.htm
 *     https://en.wikipedia.org/wiki/ISO_4217
 *     https://en.wikipedia.org/wiki/Currency_symbol
 *     https://en.wikipedia.org/wiki/Decimal_separator
 *     https://www.thefinancials.com/Default.aspx?SubSectionID=curformat
 *     https://www.loc.gov/standards/iso639-2/php/English_list.php
 *
 * @param rawLocaleCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @param amount
 *   Integer amount in minor currency units. Examples: $1.00 USD and ¥100 JPY
 *   are both passed as 100.
 * @returns Localized monetary amount
 */
export function localizeMonetaryAmount(
	rawLocaleCode: LocaleCode< Raw >,
	currencyCode: CurrencyCode,
	amount: CheckedNumber< Raw >
): LocalizedMonetaryAmount {
	// Validate arguments
	const localeCode = normalizeLocaleCode( rawLocaleCode );
	const validatedAmount = validateInteger( amount );

	return localizeCurrencyWithSchema(
		signOf( validatedAmount ),
		absoluteValue( validatedAmount ),
		localeCode,
		currencyCode,
		currencyFormattingSchema( localeCode, currencyCode )
	);
}

/**
 * Type alias for localized currency strings
 */
type LocalizedMonetaryAmount = string;

/**
 * Representation of the possible currency schemas
 */
const enum CurrencyFormat {
	LocalSymbol_Amount,
	LocalSymbol_Amount_Code,
}

/**
 * A monetary amount string should be displayed as a unit with
 * no line breaks. We use non-breaking spaces to ensure this.
 *
 * @type {string}
 */
const NBSP = '\u00A0';

/**
 * Selects a reified formatting style for the given locale and currency.
 * This style is represented by a slug called a /schema/, and consumed by
 * localizeCurrencyWithSchema() to construct the formatted string.
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns Currency formatting schema slug
 */
function currencyFormattingSchema(
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode
): CurrencyFormat {
	switch ( localeCode ) {
		case 'en-us':
			// Most common case first
			if ( currencyCode === 'USD' ) {
				return CurrencyFormat.LocalSymbol_Amount;
			}

			if ( hasUniqueLocalSymbol( currencyCode ) ) {
				return CurrencyFormat.LocalSymbol_Amount;
			}

			switch ( currencyCode ) {
				case 'GBP':
					return CurrencyFormat.LocalSymbol_Amount;

				default:
					return CurrencyFormat.LocalSymbol_Amount_Code;
			}

		default:
			if ( hasUniqueLocalSymbol( currencyCode ) ) {
				return CurrencyFormat.LocalSymbol_Amount;
			}

			switch ( currencyCode ) {
				case 'GBP':
					return CurrencyFormat.LocalSymbol_Amount;

				// Default to generic verbose format
				default:
					return CurrencyFormat.LocalSymbol_Amount_Code;
			}
	}
}

/**
 * Localize a monetary amount using the given schema slug.
 *
 * @param sign
 *   For distinguishing positive, negative, and zero amounts
 * @param amount
 *   Whole number of minor currency units, cannot be negative
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @param schema
 *   A slug representing a currency format
 * @returns Localized monetary amount
 */
function localizeCurrencyWithSchema(
	sign: Sign,
	amount: CheckedNumber< NonNegativeInteger >,
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode,
	schema: CurrencyFormat
): LocalizedMonetaryAmount {
	const currencySymbol = localSymbolForCurrency( localeCode, currencyCode );
	const signSymbol = sign === Sign.IsNegative ? '-' : '';

	switch ( schema ) {
		// $1,000.50
		case CurrencyFormat.LocalSymbol_Amount:
			if ( Sign.IsZero === sign ) {
				return currencySymbol + '0';
			}

			return (
				signSymbol + currencySymbol + renderAmountWithSeparators( amount, localeCode, currencyCode )
			);

		// $1,000.50 USD
		case CurrencyFormat.LocalSymbol_Amount_Code:
			if ( Sign.IsZero === sign ) {
				return currencySymbol + '0' + NBSP + currencyCode;
			}

			return (
				signSymbol +
				currencySymbol +
				renderAmountWithSeparators( amount, localeCode, currencyCode ) +
				NBSP +
				currencyCode
			);

		default:
			throw new Error( `Unrecognized currency format ${ schema }` );
	}
}

/**
 * Localize a nonnegative number of minimal currency units. Does not
 * include any currency symbols.
 *
 * @param amount
 *   Whole number amount in minimal currency units; cannot be negative
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns Localized amount string
 */
function renderAmountWithSeparators(
	amount: CheckedNumber< NonNegativeInteger >,
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode
): string {
	const { integerPart, fractionalPart } = digitGroupsOfAmountForCurrency(
		localeCode,
		currencyCode,
		amount
	);
	const { groupSeparator } = separatorsForLocale( localeCode );
	const base = minorUnitsPerMajorUnit( currencyCode );

	// Currencies with no minor unit
	if ( 1 === base ) {
		return integerPart.join( groupSeparator );
	}

	return integerPart.join( groupSeparator ) + fractionalPart;
}

/**
 * Represents the digit groups of a formatted number. The
 * integer part is sorted from most to least significant.
 */
interface DigitGrouping {
	integerPart: string[];
	fractionalPart: string;
}

/**
 * Separate an amount into its fractional part and grouped digits
 * of the integer part.
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @param amount
 *   Whole number amount in minimal currency units; cannot be negative
 * @returns
 *   Digit groups; the integer part is sorted from most to least significant
 */
function digitGroupsOfAmountForCurrency(
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode,
	amount: CheckedNumber< NonNegativeInteger >
): DigitGrouping {
	// Zero money is a special case.
	if ( 0 === amount ) {
		return {
			integerPart: [ '0' ],
			fractionalPart: minorUnitsAsDecimalForCurrency( localeCode, currencyCode, 0 ),
		};
	}

	const base = minorUnitsPerMajorUnit( currencyCode );

	// Currencies with no minor unit are a special case.
	if ( 1 === base ) {
		return {
			integerPart: groupDigits( localeCode, amount ),
			fractionalPart: '',
		};
	}

	const fractionalPart = minorUnitsAsDecimalForCurrency( localeCode, currencyCode, amount % base );
	const majorUnitAmount = Math.floor( amount / base );

	return {
		integerPart: groupDigits( localeCode, majorUnitAmount ),
		fractionalPart: fractionalPart,
	};
}

/**
 * Computes the digit groups of an integer as an array of strings from most
 * to least significant. This depends on the locale, as customs for grouping
 * digits differ around the world.
 *
 * @examples
 *   - US:    100,000,000
 *   - India: 10,00,00,000
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'. Must be lower case.
 * @param amount
 *   Number to decompose; must be nonnegative
 * @returns
 *   Digit groups as strings, from most to least significant
 */
function groupDigits(
	localeCode: LocaleCode< Normalized >,
	amount: CheckedNumber< NonNegativeInteger >
): string[] {
	// Accumulating recursive function that splits digits into
	// groups of a fixed size. Interior groups are zero-padded.
	function groupDigitsAccum(
		localAmount: number,
		localDigits: string[],
		numDigitsPerGroup: number
	) {
		const base = 10 ** numDigitsPerGroup;

		if ( localAmount < base ) {
			return [ localAmount.toString() ].concat( localDigits );
		}

		const nextGroup = localAmount % base;
		const remaining = Math.floor( localAmount / base );

		return groupDigitsAccum(
			remaining,
			[ nextGroup.toString().padStart( numDigitsPerGroup, '0' ) ].concat( localDigits ),
			numDigitsPerGroup
		);
	}

	switch ( localeCode ) {
		// Locales with "2*3" style digit groups
		case 'bn': // Bengali
		case 'en-in': // English - India
		case 'en-pk': // English - Pakistan
		case 'hi': // Hindi
		case 'in': // India
		case 'my': // Burmese
		case 'ne': // Nepali
		case 'pk': // Pakistan
		case 'si': // Sinhala
		case 'ta': // Tamil
		case 'ur': // Urdu
			if ( amount < 1000 ) {
				return [ amount.toString() ];
			}

			return groupDigitsAccum(
				Math.floor( amount / 1000 ),
				[ ( amount % 1000 ).toString().padStart( 3, '0' ) ],
				2
			);

		// Locales with "3*" style digit groups
		default:
			return groupDigitsAccum( amount, [], 3 );
	}
}

/**
 * Formats fractional currency units with the radix symbol.
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @param amount
 *   Number of minor currency units. Must be positive, and must be in
 *   the range [0 .. minorUnitsPerMajorUnit - 1]
 * @returns
 *   Fractional currency string with radix symbol
 */
function minorUnitsAsDecimalForCurrency(
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode,
	amount: CheckedNumber< NonNegativeInteger >
): string {
	const radixSymbol = separatorsForLocale( localeCode ).decimalSeparator;

	switch ( currencyCode ) {
		// Let's catch the common cases first
		case 'AUD': // Australian dollar
		case 'BRL': // Brazilian real
		case 'CAD': // Canadian dollar
		case 'USD': // US dollar
			if ( amount < 0 || 100 <= amount ) {
				throw new Error(
					`Minor units should be between 0 and 99 inclusive; ${ amount } is invalid`
				);
			}
			if ( amount === 0 ) {
				return '';
			}
			return radixSymbol + amount.toString().padStart( 2, '0' );

		// Currencies with no minor unit
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
			throw new Error( `Currency does not have a minor unit: ${ currencyCode }` );

		// 10000 minor units per major unit
		case 'CLF': // Unidad de Fomento
		case 'UYW': // Unidad Previsional
			if ( amount < 0 || 10000 <= amount ) {
				throw new Error(
					`Minor units should be between 0 and 9999 inclusive; ${ amount } is invalid`
				);
			}
			if ( amount === 0 ) {
				return '';
			}
			return radixSymbol + amount.toString().padStart( 4, '0' );

		// 1000 minor units per major unit
		case 'BHD': // Bahraini dinar
		case 'IQD': // Iraqi dinar
		case 'JOD': // Jordanian dinar
		case 'KWD': // Kuwaiti dinar
		case 'LYD': // Libyan dinar
		case 'OMR': // Rial Omani
		case 'TND': // Tunisian dinar
			if ( amount < 0 || 1000 <= amount ) {
				throw new Error(
					`Minor units should be between 0 and 999 inclusive; ${ amount } is invalid`
				);
			}
			if ( amount === 0 ) {
				return '';
			}
			return radixSymbol + amount.toString().padStart( 3, '0' );

		// 5 minor units per major unit (!!!)
		case 'MGA': // Malagasy ariary
		case 'MRU': // Mauritanian ouguiya
			if ( amount < 0 || 5 <= amount ) {
				throw new Error(
					`Minor units should be between 0 and 4 inclusive; ${ amount } is invalid`
				);
			}
			if ( amount === 0 ) {
				return '';
			}
			return radixSymbol + ( amount * 20 ).toString();

		// Otherwise assume 100 minor units per major unit
		default:
			if ( amount < 0 || 100 <= amount ) {
				throw new Error(
					`Minor units should be between 0 and 99 inclusive; ${ amount } is invalid`
				);
			}
			if ( amount === 0 ) {
				return '';
			}
			return radixSymbol + amount.toString().padStart( 2, '0' );
	}
}

/**
 * Local currency symbol as used in its issuing jurisdiction. May not be unique.
 * Note that some symbols vary by language.
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'. Must be lower case.
 * @param currencyCode
 *   ISO 4217 currency code. Examples: 'USD', 'JPY', 'BRL'.
 * @returns Local currency symbol. May not be unique.
 */
function localSymbolForCurrency(
	localeCode: LocaleCode< Normalized >,
	currencyCode: CurrencyCode
): string {
	switch ( currencyCode ) {
		// Let's catch the most common cases early
		case 'USD': // United States dollar
		case 'AUD': // Australian dollar
		case 'CAD': // Canadian dollar
			return '$';

		case 'EUR': // Euro
			return '€';

		case 'GBP': // British pound
			return '£';

		// $
		case 'ARS': // Argentine peso
		case 'BBD': // Barbadian dollar
		case 'BMD': // Bermudian dollar
		case 'BND': // Brunei dollar
		case 'BZD': // Belize dollar
		case 'BSD': // Bahamian dollar
		case 'CLP': // Chilean peso
		case 'COP': // Colombian peso
		case 'KYD': // Cayman Islands dollar
		case 'CUC': // Cuban convertible peso
		case 'CUP': // Cuban peso
		case 'CVE': // Cape Verdean escudo
		case 'DOP': // Dominican peso
		case 'FJD': // Fijian dollar
		case 'GYD': // Guyanese dollar
		case 'HKD': // Hong Kong dollar
		case 'KID': // Kiribati dollar
		case 'JMD': // Jamaican dollar
		case 'LRD': // Liberian dollar
		case 'MXN': // Mexican peso
		case 'NAD': // Namibian dollar
		case 'NZD': // New Zealand dollar
		case 'SBD': // Solomon Islands dollar
		case 'SGD': // Singapore dollar
		case 'SRD': // Surinamese dollar
		case 'TTD': // Trinidad and Tobago dollar
		case 'TVD': // Tuvaluan dollar
		case 'TWD': // New Taiwan dollar
		case 'UYU': // Uruguayan peso
		case 'XCD': // Eastern Caribbean dollar
			return '$';

		// kr
		case 'DKK': // Danish krone
		case 'ISK': // Icelandic króna
		case 'NOK': // Norwegian krone
		case 'SEK': // Swedish krona
			return 'kr';

		// Fr
		case 'BIF': // Burundian franc
		case 'CDF': // Congolese franc
		case 'DJF': // Djiboutian franc
		case 'GNF': // Guinean franc
		case 'KMF': // Comorian franc
		case 'RWF': // Rwandan franc
		case 'XAF': // Central African CFA franc
		case 'XOF': // West African CFA franc
			return 'Fr';

		// £
		case 'IMP': // Manx pound (Isle of Man)
		case 'JEP': // Jersey pound
		case 'FKP': // Falkland Islands pound
		case 'GGP': // Guernsey pound
		case 'GIP': // Gibraltar pound
		case 'SHP': // Saint Helena pound
		case 'SSP': // South Sudanese pound
			return '£';

		// Sh
		case 'KES': // Kenyan shilling
		case 'SOS': // Somali shilling
		case 'TZS': // Tanzanian shilling
		case 'UGX': // Ugandan shilling
			return 'Sh';

		// ₨
		case 'MUR': // Mauritian rupee
		case 'PKR': // Pakistani rupee
		case 'SCR': // Seychellois rupee
			return '₨';

		// ₩
		case 'KPW': // North Korean won
		case 'KRW': // South Korean won
			return '₩';

		// Unique currency symbols
		case 'AED': // United Arab Emirates dirham
			return 'د.إ';
		case 'AFN': // Afghan afghani
			return '؋';
		case 'ALL': // Albanian lek
			return 'L';
		case 'AMD': // Armenian dram
			return '֏';
		case 'ANG': // Netherlands Antillean guilder
			return 'ƒ';
		case 'AOA': // Angolan kwanza
			return 'Kz';
		case 'AWG': // Aruban florin
			return 'ƒ';
		case 'AZN': // Azerbaihani manat
			return '₼';
		case 'BAM': // Bosnia and Herzegovina convertible mark
			return 'KM';
		case 'BDT': // Bangladeshi taka
			return '৳ ';
		case 'BGN': // Bulgarian lev
			return 'лв.';
		case 'BHD': // Bahraini dinar
			return '.د.ب';
		case 'BOB': // Boliviano
			return 'Bs.';
		case 'BRL': // Brazilian real
			return 'R$';
		case 'BTN': // Bhutanese ngultrum
			return 'Nu.';
		case 'BWP': // Botswana pula
			return 'P';
		case 'BYN': // Belarusian ruble
			return 'Br';
		case 'CHF': // Swiss franc
			return 'Fr.';
		case 'CNY': // Chinese yuan
			return '元';
		case 'CRC': // Costa Rican colón
			return '₡';
		case 'CZK': // Czech koruna
			return 'Kč';
		case 'DZD': // Algerian dinar
			return 'د.ج';
		case 'EGP': // Egyptian pound
			switch ( localeCode ) {
				case 'ar-eg':
					return 'ج.م';
				default:
					return 'E£';
			}
		case 'ERN': // Eritrean nakfa
			return 'Nfk';
		case 'ETB': // Ethiopian birr
			return 'Br';
		case 'GEL': // Geolrian lari
			return '₾';
		case 'GHS': // Ghanaian cedi
			return '₵';
		case 'GMD': // Gambian dalasi
			return 'D';
		case 'GTQ': // Guatemalan quetzal
			return 'Q';
		case 'HNL': // Honduran lempira
			return 'L';
		case 'HRK': // Croatian kuna
			return 'kn';
		case 'HTG': // Haitian gourde
			return 'G';
		case 'HUF': // Hungarian forint
			return 'Ft';
		case 'IDR': // Indonesian rupiah
			return 'Rp';
		case 'ILS': // Israeli shekel
			return '₪';
		case 'INR': // Indian rupee
			return '₹';
		case 'IQD': // Iraqi dinar
			return 'ع.د';
		case 'IRR': // Iranian dinar
			return '﷼';
		case 'JOD': // Jordanian dinar
			return 'د.ا';
		case 'JPY': // Japanese yen
			return '¥';
		case 'KGS': // Kyrgyzstani som
			return 'с';
		case 'KHR': // Cambodian riel
			return '៛';
		case 'KWD': // Kuwaiti dinar
			return 'د.ك';
		case 'KZT': // Kazakhstani tenge
			return '₸';
		case 'LAK': // Lao kip
			return '₭';
		case 'LBP': // Lebanese pound
			return 'ل.ل';
		case 'LKR': // Sri Lankan rupee
			switch ( localeCode ) {
				case 'si': // Sinhala
					return 'රු';
				case 'ta': // Tamil
					return 'ரூ';
				default:
					return 'Rs.';
			}
		case 'LSL': // Lesotho loti
			return 'L';
		case 'LYD': // Libyan dinar
			return 'ل.د';
		case 'MAD': // Moroccan dirham
			return 'د.م.';
		case 'MDL': // Moldovan leu
			return 'L';
		case 'MGA': // Malagasy ariary
			return 'Ar';
		case 'MKD': // Macedonian denar
			return 'ден';
		case 'MMK': // Burmese kyat
			return 'Ks';
		case 'MNT': // Mongolian tögrög
			return '₮';
		case 'MOP': // Macanese pataca
			return 'P';
		case 'MRU': // Mauritanian ouguiya
			return 'UM';
		case 'MVR': // Maldivian rufiyaa
			return '.ރ';
		case 'MWK': // Malawian kwacha
			return 'MK';
		case 'MYR': // Malaysian ringgit
			return 'RM';
		case 'MZN': // Mozambican metical
			return 'MT';
		case 'NGN': // Nigerian naira
			return '₦';
		case 'NIO': // Nicaraguan córdoba
			return 'C$';
		case 'NPR': // Nepalese rupee
			return 'रू';
		case 'OMR': // Omani rial
			return 'ر.ع.';
		case 'PAB': // Panamanian balboa
			return 'B/.';
		case 'PEN': // Perfuvian sol
			return 'S/';
		case 'PGK': // Papua New Guinean kina
			return 'K';
		case 'PHP': // Philippine peso
			return '₱';
		case 'PLN': // Polish złoty
			return 'zł';
		case 'PRB': // Transnistrian ruble
			return 'p.';
		case 'PYG': // Paraguayan guarani
			return '₲';
		case 'QAR': // Qatari riyal
			return 'ر.ق';
		case 'RON': // Romanian leu
			return 'lei';
		case 'RSD': // Serbian dinar
			return 'дин.';
		case 'RUB': // Russian ruble, also Pokédollar
			return '₽';
		case 'SAR': // Saudi riyal
			return 'ر.س';
		case 'SDG': // Sudanese pound
			return 'ج.س.';
		case 'SLL': // Sierra Leonean leone
			return 'Le';
		case 'SLS': // Somaliland shilling
			return 'Sl';
		case 'STN': // São Tomé and Príncipe dobra
			return 'Db';
		case 'SYP': // Syrian pound
			return '£S';
		case 'SZL': // Swazi lilangeni
			return 'L';
		case 'THB': // Thai baht
			return '฿';
		case 'TJS': // Tajikistani somoni
			return 'SM';
		case 'TMT': // Turkmenistan manat
			return 'm';
		case 'TND': // Tunisian dinar
			return 'د.ت';
		case 'TOP': // Tongan pa'anga
			return 'T$';
		case 'TRY': // Turkish lira
			return '₺';
		case 'UAH': // Ukrainian hryvnia
			return '₴';
		case 'UZS': // Uzbekistani so'm
			return 'сўм';
		case 'VES': // Venezuelan bolívar
			return 'Bs.S.';
		case 'VND': // Vietnamese đồng
			return '₫';
		case 'VUV': // Vanuatu vatu
			return 'Vt';
		case 'WST': // Samoan tālā
			return 'T';
		case 'XPF': // CFP franc
			return '₣';
		case 'YER': // Yemeni rial
			return '﷼';
		case 'ZAR': // South African rand
			return 'R';
		case 'ZMW': // Zambian kwacha
			return 'ZK';

		default:
			throw new Error( `Symbol for currency code not defined: ${ currencyCode }` );
	}
}

/**
 * Type representing a digit separator custom.
 *
 *   * `decimalSeparator` is the symbol used for the radix point
 *   * `groupSeparator` is the symbol used to demarcate digit groups
 *
 * @see separatorsForLocale()
 */
interface DigitSeparators {
	decimalSeparator: string;
	groupSeparator: string;
}

/**
 * Customary radix point and group separators in a given locale. Note
 * that we're using non-breaking spaces.
 *
 * @param localeCode
 *   ISO 631-1 language code with an optional ISO 3166-1 alpha-2 region code,
 *   separated by a hyphen. Examples: 'en', 'en-gb', 'fr-be'.
 * @returns Decimal and group separators
 */
function separatorsForLocale( localeCode: LocaleCode< Normalized > ): DigitSeparators {
	switch ( localeCode ) {
		// 10,000.00
		case 'en-hk': // English - Hong Kong
		case 'en-ie': // English - Ireland
		case 'en-gb': // English - United Kingdom
		case 'en-nz': // English - New Zealand
		case 'en-us': // English - United States
		case 'es-mx': // Spanish - Mexico
		case 'hi': // Hindi
		case 'he': // Hebrew
		case 'ja': // Japanese
		case 'ko': // Korean
			return { decimalSeparator: '.', groupSeparator: ',' };

		// 10 000.00
		case 'en-au': // English - Australia
		case 'en-ca': // Canada
			return { decimalSeparator: '.', groupSeparator: NBSP };

		// 10 000,00
		case 'af': // Afrikaans
		case 'cs': // Czech
		case 'en-za': // English - South Africa
		case 'et': // Estonian
		case 'fi': // Finnish
		case 'fr': // French
		case 'fr-be': // French - Belgium
		case 'fr-ca': // French - Canada
		case 'fr-ch': // French - Switzerland
		case 'fr-lu': // French - Luxembourg
		case 'hu': // Hungarian
		case 'no': // Norwegian
		case 'nb': // Norwegian (Bokmål)
		case 'nn': // Norwegian (Nynorsk)
			return { decimalSeparator: ',', groupSeparator: NBSP };

		// 10.000,00
		case 'es-ar': // Spanish - Argentina
		case 'de': // German
		case 'de-at': // German - Austria
		case 'pt-br': // Portugese - Brazil
			return { decimalSeparator: ',', groupSeparator: '.' };

		// 10.000$00
		case 'pt-cv': // Portugese - Cape Verde
			return { decimalSeparator: '$', groupSeparator: '.' };

		// 10,000.00
		default:
			return { decimalSeparator: '.', groupSeparator: ',' };
	}
}

/**
 * Type alias for ISO 631-1 language codes with an optional
 * ISO 3166-1 alpha-2 region code, separated by a hyphen.
 *
 * Note the phantom type parameter. Like the CurrencyCode type,
 * we want to normalize locale codes to a unique representation,
 * but unlike CurrencyCode it is not feasible to enumerate
 * all the possible values as a sum. Instead, our code is written
 * against the LocaleCode<Normalized> type, which can only be
 * produced by `normalizeLocaleCode` (which should be called
 * exactly once and not exported from this module).
 *
 * @examples 'en', 'en-gb', 'fr-be'
 */
export type LocaleCode< a > = string;

export type Raw = void;
type Normalized = void;

/**
 * Normalize a raw locale code. Do not export this.
 *
 * @param rawLocaleCode
 *     Locale code string as returned by the browser.
 * @returns
 *     Normalized locale code (all lower case).
 */
function normalizeLocaleCode( rawLocaleCode: LocaleCode< Raw > ): LocaleCode< Normalized > {
	return rawLocaleCode.toLowerCase();
}
