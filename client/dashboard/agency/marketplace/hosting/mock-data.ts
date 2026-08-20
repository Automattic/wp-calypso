/**
 * Prototype-only pricing data, shaped after the `/agency/products` response
 * (see APIProductFamilyProduct in client/a8c-for-agencies), so it can be
 * replaced by an @automattic/api-queries factory without reshaping the UI.
 * The WordPress.com yearly ladder mirrors production; monthly figures are
 * placeholders pending real Billing Dragon data.
 */

export interface TierPrice {
	units: number;
	price: number;
}

export interface HostingProduct {
	name: string;
	slug: string;
	family_slug: string;
	currency: string;
	monthly_price: number;
	yearly_price: number;
	tier_monthly_prices?: TierPrice[];
	tier_yearly_prices?: TierPrice[];
}

export interface HostingBrand {
	key: 'wpcom' | 'pressable' | 'vip';
	name: string;
	description: string;
	priceNote: string;
	product?: HostingProduct;
}

const WPCOM_YEARLY_LADDER: TierPrice[] = [
	{ units: 1, price: 300 },
	{ units: 2, price: 300 },
	{ units: 3, price: 201 },
	{ units: 4, price: 180 },
	{ units: 5, price: 150 },
	{ units: 6, price: 141 },
	{ units: 7, price: 132 },
	{ units: 8, price: 120 },
	{ units: 9, price: 111 },
	{ units: 10, price: 102 },
];

const WPCOM_MONTHLY_LADDER: TierPrice[] = WPCOM_YEARLY_LADDER.map( ( { units, price } ) => ( {
	units,
	price: Math.round( ( price / 10 ) * 100 ) / 100,
} ) );

export const wpcomHosting: HostingProduct = {
	name: 'WordPress.com',
	slug: 'wpcom-hosting-business',
	family_slug: 'wpcom-hosting',
	currency: 'USD',
	monthly_price: 30,
	yearly_price: 300,
	tier_monthly_prices: WPCOM_MONTHLY_LADDER,
	tier_yearly_prices: WPCOM_YEARLY_LADDER,
};

export const pressableSignature1: HostingProduct = {
	name: 'Pressable Signature 1',
	slug: 'pressable-signature-1',
	family_slug: 'pressable-hosting',
	currency: 'USD',
	monthly_price: 25,
	yearly_price: 250,
};

export const hostingBrands: HostingBrand[] = [
	{
		key: 'wpcom',
		name: 'WordPress.com',
		description:
			'Best for most client sites. Managed WordPress with staging, backups, and 24/7 expert support.',
		priceNote: 'From US$300 per site, per year',
		product: wpcomHosting,
	},
	{
		key: 'pressable',
		name: 'Pressable',
		description:
			'Best for growing portfolios. Plans that pool traffic and storage across all your client sites.',
		priceNote: 'From US$250 per year',
		product: pressableSignature1,
	},
	{
		key: 'vip',
		name: 'WordPress VIP',
		description:
			'Best for enterprise clients. Enterprise-grade security, scale, and guided onboarding.',
		priceNote: 'Custom pricing',
	},
];

export interface TieredPriceResult {
	basePerUnit: number;
	perUnit: number;
	actualCost: number;
	discountedCost: number;
	discountPercent: number;
}

export function getTieredPrice(
	product: HostingProduct,
	quantity: number,
	term: 'monthly' | 'yearly'
): TieredPriceResult {
	const basePerUnit = term === 'yearly' ? product.yearly_price : product.monthly_price;
	const ladder =
		( term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices ) ?? [];
	const tier = ladder.filter( ( t ) => t.units <= quantity ).pop();
	const perUnit = tier?.price ?? basePerUnit;
	return {
		basePerUnit,
		perUnit,
		actualCost: basePerUnit * quantity,
		discountedCost: perUnit * quantity,
		discountPercent: basePerUnit > 0 ? ( basePerUnit - perUnit ) / basePerUnit : 0,
	};
}

export function getNextDiscountNudge(
	product: HostingProduct,
	quantity: number,
	term: 'monthly' | 'yearly'
): { addMore: number; discountPercent: number } | null {
	const ladder =
		( term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices ) ?? [];
	const current = getTieredPrice( product, quantity, term );
	const next = ladder.find(
		( t ) => t.units > quantity && t.price < ( current.perUnit ?? Infinity )
	);
	if ( ! next ) {
		return null;
	}
	return {
		addMore: next.units - quantity,
		discountPercent: ( current.basePerUnit - next.price ) / current.basePerUnit,
	};
}

export function formatUSD( amount: number ): string {
	const hasCents = Math.round( amount * 100 ) % 100 !== 0;
	return `US$${ amount.toLocaleString( 'en-US', {
		minimumFractionDigits: hasCents ? 2 : 2,
		maximumFractionDigits: 2,
	} ) }`;
}
