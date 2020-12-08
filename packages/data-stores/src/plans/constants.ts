/**
 * External dependencies
 */
// plans constants
export const PLAN_FREE = 'free_plan';
export const PLAN_PERSONAL = 'personal-bundle';
export const PLAN_PREMIUM = 'value_bundle';
export const PLAN_BUSINESS = 'business-bundle';
export const PLAN_ECOMMERCE = 'ecommerce-bundle';

export const STORE_KEY = 'automattic/onboard/plans';

export const DEFAULT_PAID_PLAN = PLAN_PREMIUM;
interface Currency {
	format: 'SYMBOL_THEN_AMOUNT' | 'AMOUNT_THEN_SYMBOL';
	symbol: string;
	decimal: number;
}

export const plansOrder = [ PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_ECOMMERCE ];

export const plansPaths = [ 'free', 'personal', 'premium', 'business', 'ecommerce' ];

export const plansProductSlugs = [
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
];

// salvaged from https://opengrok.a8c.com/source/raw/trunk/wp-content/admin-plugins/wpcom-billing/store-price.php
// with html entities resolved to symbols
export const currenciesFormats: Record< string, Currency > = {
	USD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: '$',
		decimal: 2,
	},
	GBP: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: '£',
		decimal: 2,
	},
	JPY: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: '¥',
		decimal: 0,
	},
	BRL: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'R$',
		decimal: 2,
	},
	EUR: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: '€',
		decimal: 2,
	},
	NZD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'NZ$',
		decimal: 2,
	},
	AUD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'A$',
		decimal: 2,
	},
	CAD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'C$',
		decimal: 2,
	},
	IDR: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'Rp',
		decimal: 0,
	},
	INR: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: '₹',
		decimal: 0,
	},
	ILS: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: '₪',
		decimal: 2,
	},
	RUB: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: '₽',
		decimal: 2,
	},
	MXN: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'MX$',
		decimal: 2,
	},
	SEK: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'SEK',
		decimal: 2,
	},
	HUF: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'Ft',
		decimal: 0, // Decimals are supported by Stripe but not by PayPal
	},
	CHF: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'CHF',
		decimal: 2,
	},
	CZK: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'Kč',
		decimal: 2,
	},
	DKK: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'Dkr',
		decimal: 2,
	},
	HKD: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'HK$',
		decimal: 2,
	},
	NOK: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'Kr',
		decimal: 2,
	},
	PHP: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: '₱',
		decimal: 2,
	},
	PLN: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'PLN',
		decimal: 2,
	},
	SGD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'S$',
		decimal: 2,
	},
	TWD: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: 'NT$',
		decimal: 0, // Decimals are supported by Stripe but not by PayPal
	},
	THB: {
		format: 'SYMBOL_THEN_AMOUNT',
		symbol: '฿',
		decimal: 2,
	},
	TRY: {
		format: 'AMOUNT_THEN_SYMBOL',
		symbol: 'TL', // The official ₺ is not used as often as TL.
		decimal: 2,
	},
};
