// For converting other currencies into USD for tracking purposes.
// Short-term fix, taken from <https://openexchangerates.org/> (last updated 2019-04-10).
const EXCHANGE_RATES = {
	AED: 3.673181,
	AFN: 77.277444,
	ALL: 110.685,
	AMD: 485.718536,
	ANG: 1.857145,
	AOA: 318.1145,
	ARS: 42.996883,
	AUD: 1.39546,
	AWG: 1.801247,
	AZN: 1.7025,
	BAM: 1.73465,
	BBD: 2,
	BDT: 84.350813,
	BGN: 1.7345,
	BHD: 0.377065,
	BIF: 1829.456861,
	BMD: 1,
	BND: 1.350704,
	BOB: 6.910218,
	BRL: 3.825491,
	BSD: 1,
	BTC: 0.000188070491,
	BTN: 69.241,
	BWP: 10.571,
	BYN: 2.12125,
	BZD: 2.01582,
	CAD: 1.331913,
	CDF: 1640.538151,
	CHF: 1.002295,
	CLF: 0.024214,
	CLP: 662.405194,
	CNH: 6.718409,
	CNY: 6.7164,
	COP: 3102.756403,
	CRC: 603.878956,
	CUC: 1,
	CUP: 25.75,
	CVE: 98.34575,
	CZK: 22.699242,
	DJF: 178,
	DKK: 6.620894,
	DOP: 50.601863,
	DZD: 119.094464,
	EGP: 17.321,
	ERN: 14.996695,
	ETB: 28.87,
	EUR: 0.886846,
	FJD: 2.135399,
	FKP: 0.763495,
	GBP: 0.763495,
	GEL: 2.695,
	GGP: 0.763495,
	GHS: 5.18885,
	GIP: 0.763495,
	GMD: 49.5025,
	GNF: 9126.453332,
	GTQ: 7.6503,
	GYD: 207.888008,
	HKD: 7.83635,
	HNL: 24.53,
	HRK: 6.587,
	HTG: 84.642,
	HUF: 285.120971,
	IDR: 14140.665178,
	ILS: 3.57935,
	IMP: 0.763495,
	INR: 69.1502,
	IQD: 1190,
	IRR: 42105,
	ISK: 119.899897,
	JEP: 0.763495,
	JMD: 129.28,
	JOD: 0.709001,
	JPY: 110.9875,
	KES: 101.11,
	KGS: 68.708365,
	KHR: 4021.592884,
	KMF: 437.375,
	KPW: 900,
	KRW: 1137.899434,
	KWD: 0.304268,
	KYD: 0.833459,
	KZT: 378.893401,
	LAK: 8630.377846,
	LBP: 1509.5,
	LKR: 174.733735,
	LRD: 164.499779,
	LSL: 14.1,
	LYD: 1.391411,
	MAD: 9.622,
	MDL: 17.513226,
	MGA: 3642.597503,
	MKD: 54.731723,
	MMK: 1510.092364,
	MNT: 2511.632328,
	MOP: 8.07298,
	MRO: 357,
	MRU: 36.55,
	MUR: 34.9505,
	MVR: 15.424994,
	MWK: 728.565,
	MXN: 18.8201,
	MYR: 4.1106,
	MZN: 64.576343,
	NAD: 14.11,
	NGN: 360.105269,
	NIO: 33.04,
	NOK: 8.49614,
	NPR: 110.785702,
	NZD: 1.47776,
	OMR: 0.38502,
	PAB: 1,
	PEN: 3.294475,
	PGK: 3.374968,
	PHP: 51.872601,
	PKR: 141.62807,
	PLN: 3.79605,
	PYG: 6186.225628,
	QAR: 3.641793,
	RON: 4.217807,
	RSD: 104.64086,
	RUB: 64.2743,
	RWF: 904.135,
	SAR: 3.75,
	SBD: 8.21464,
	SCR: 13.675964,
	SDG: 47.613574,
	SEK: 9.261891,
	SGD: 1.351801,
	SHP: 0.763495,
	SLL: 8390,
	SOS: 578.545,
	SRD: 7.458,
	SSP: 130.2634,
	STD: 21050.59961,
	STN: 21.8,
	SVC: 8.751385,
	SYP: 514.993308,
	SZL: 13.972654,
	THB: 31.75,
	TJS: 9.434819,
	TMT: 3.509961,
	TND: 3.0117,
	TOP: 2.267415,
	TRY: 5.683728,
	TTD: 6.768744,
	TWD: 30.840434,
	TZS: 2315.252864,
	UAH: 26.819481,
	UGX: 3758.198709,
	USD: 1,
	UYU: 33.969037,
	UZS: 8427.57062,
	VEF: 248487.642241,
	VES: 3305.47961,
	VND: 23197.866398,
	VUV: 111.269352,
	WST: 2.607815,
	XAF: 581.732894,
	XAG: 0.06563851,
	XAU: 0.00076444,
	XCD: 2.70255,
	XDR: 0.717354,
	XOF: 581.732894,
	XPD: 0.00071959,
	XPF: 105.828888,
	XPT: 0.00110645,
	YER: 250.35,
	ZAR: 13.909458,
	ZMW: 12.110083,
	ZWL: 322.355011,
};

/**
 * Returns whether a currency is supported
 *
 * @param {string} currency - `USD`, `JPY`, etc
 * @returns {boolean} Whether there's an exchange rate for the currency
 */
function isSupportedCurrency( currency ) {
	return Object.keys( EXCHANGE_RATES ).indexOf( currency ) !== -1;
}

/**
 * Converts a cost into USD
 *
 * Don't rely on this for precise conversions, it's meant to be an estimate for ad tracking purposes
 *
 * @param {number} cost - The cost of the cart or product
 * @param {string} currency - The currency such as `USD`, `JPY`, etc
 * @returns {string} Or null if the currency is not supported
 */
export default function costToUSD( cost, currency ) {
	if ( ! isSupportedCurrency( currency ) ) {
		return null;
	}

	return ( cost / EXCHANGE_RATES[ currency ] ).toFixed( 3 );
}
