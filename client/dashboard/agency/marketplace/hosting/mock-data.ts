/**
 * Prototype-only pricing data, shaped after the `/agency/products` response
 * (see APIProductFamilyProduct in client/a8c-for-agencies), so it can be
 * replaced by an @automattic/api-queries factory without reshaping the UI.
 * The WordPress.com yearly ladder and the Pressable Signature plan specs
 * mirror production; monthly figures and unlabeled Signature prices are
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

export interface PressablePlan {
	slug: string;
	name: string;
	install: number;
	visits: number;
	storage: number;
	worker: number;
	category: 'signature' | 'signature-high' | 'premium';
	yearly_price?: number;
	monthly_price?: number;
}

export const pressableSignaturePlans: PressablePlan[] = [
	{
		slug: 'pressable-signature-1',
		name: 'Signature 1',
		install: 1,
		visits: 30000,
		storage: 20,
		worker: 5,
		category: 'signature',
		yearly_price: 250,
	},
	{
		slug: 'pressable-signature-2',
		name: 'Signature 2',
		install: 3,
		visits: 50000,
		storage: 30,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-3',
		name: 'Signature 3',
		install: 5,
		visits: 75000,
		storage: 35,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-4',
		name: 'Signature 4',
		install: 10,
		visits: 150000,
		storage: 50,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-5',
		name: 'Signature 5',
		install: 20,
		visits: 400000,
		storage: 80,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-6',
		name: 'Signature 6',
		install: 50,
		visits: 1000000,
		storage: 200,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-7',
		name: 'Signature 7',
		install: 80,
		visits: 1600000,
		storage: 275,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-8',
		name: 'Signature 8',
		install: 100,
		visits: 2000000,
		storage: 325,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-9',
		name: 'Signature 9',
		install: 120,
		visits: 2400000,
		storage: 375,
		worker: 5,
		category: 'signature',
	},
	{
		slug: 'pressable-signature-10',
		name: 'Signature 10',
		install: 150,
		visits: 3000000,
		storage: 450,
		worker: 5,
		category: 'signature',
	},
];

// Prototype stand-in for real agency data. In production, WP.com owned-site
// counts come from license queries and Pressable usage from
// agency.third_party.pressable.usage (see PressableUsageDetails).
export const mockOwnership = {
	wpcom: {
		ownedSites: 7,
	},
	pressable: {
		planSlug: 'pressable-signature-3',
		usage: {
			sites: 4,
			visits: 62000,
			storageGB: 28,
		},
	},
};

export const pressableSignatureHighPlans: PressablePlan[] = [
	{
		slug: 'pressable-signature-11',
		name: 'Signature 11',
		install: 200,
		visits: 4000000,
		storage: 500,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-12',
		name: 'Signature 12',
		install: 250,
		visits: 5000000,
		storage: 550,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-13',
		name: 'Signature 13',
		install: 300,
		visits: 6000000,
		storage: 600,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-14',
		name: 'Signature 14',
		install: 350,
		visits: 7000000,
		storage: 700,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-15',
		name: 'Signature 15',
		install: 400,
		visits: 8000000,
		storage: 800,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-16',
		name: 'Signature 16',
		install: 450,
		visits: 9000000,
		storage: 900,
		worker: 5,
		category: 'signature-high',
	},
	{
		slug: 'pressable-signature-17',
		name: 'Signature 17',
		install: 500,
		visits: 10000000,
		storage: 1000,
		worker: 5,
		category: 'signature-high',
	},
];

export const pressablePremiumPlans: PressablePlan[] = [
	{
		slug: 'pressable-premium-1',
		name: 'Premium 1',
		install: 1,
		visits: 150000,
		storage: 30,
		worker: 10,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-2',
		name: 'Premium 2',
		install: 1,
		visits: 250000,
		storage: 40,
		worker: 10,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-3',
		name: 'Premium 3',
		install: 1,
		visits: 350000,
		storage: 50,
		worker: 13,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-4',
		name: 'Premium 4',
		install: 1,
		visits: 500000,
		storage: 60,
		worker: 15,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-5',
		name: 'Premium 5',
		install: 1,
		visits: 750000,
		storage: 70,
		worker: 15,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-6',
		name: 'Premium 6',
		install: 1,
		visits: 1000000,
		storage: 80,
		worker: 17,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-7',
		name: 'Premium 7',
		install: 1,
		visits: 2000000,
		storage: 90,
		worker: 17,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-8',
		name: 'Premium 8',
		install: 1,
		visits: 3000000,
		storage: 100,
		worker: 20,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-9',
		name: 'Premium 9',
		install: 1,
		visits: 5000000,
		storage: 125,
		worker: 20,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-10',
		name: 'Premium 10',
		install: 1,
		visits: 7000000,
		storage: 150,
		worker: 25,
		category: 'premium',
	},
	{
		slug: 'pressable-premium-11',
		name: 'Premium 11',
		install: 1,
		visits: 10000000,
		storage: 175,
		worker: 25,
		category: 'premium',
	},
];

export const pressablePlans: PressablePlan[] = [
	...pressableSignaturePlans,
	...pressableSignatureHighPlans,
	...pressablePremiumPlans,
];

export const PRESSABLE_OVERAGES = {
	storagePerGB: 0.5,
	trafficPer10kVisits: 8,
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
	},
	{
		key: 'vip',
		name: 'WordPress VIP',
		description:
			'Best for enterprise clients. Enterprise-grade security, scale, and guided onboarding.',
		priceNote: 'Custom pricing',
	},
];

export interface Testimonial {
	quote: string;
	name: string;
	role: string;
	linkLabel: string;
	linkUrl: string;
}

export const testimonialsByBrand: Record< 'wpcom' | 'pressable' | 'vip', Testimonial[] > = {
	wpcom: [
		{
			quote:
				'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.',
			name: 'Ajit Bohra',
			role: 'Founder, LUBUS',
			linkLabel: 'lubus.in',
			linkUrl: 'https://lubus.in',
		},
		{
			quote:
				'WordPress.com has been crucial to my agency’s growth. Its intuitive UI allows me to quickly create sleek, functional websites for my clients, and their reliable hosting and support enable me to rest easy, knowing my sites are in good hands.',
			name: 'Brian Lalli',
			role: 'President, Moon Rooster LLC',
			linkLabel: 'moonrooster.com',
			linkUrl: 'https://moonrooster.com',
		},
	],
	pressable: [
		{
			quote:
				'We needed a hosting provider that was as knowledgeable about WordPress as we are. With Pressable’s affiliation with Automattic, the same people behind WordPress.com and WordPress VIP, we knew we’d found the right home for our client portfolio.',
			name: 'Ben Giordano',
			role: 'Founder, Freshy',
			linkLabel: 'freshysites.com',
			linkUrl: 'https://freshysites.com',
		},
		{
			quote:
				'As an agency with hundreds of clients, Pressable changed the game for our ability to grow as a business and offer best-in-class products for our clients. With fantastic support, superior uptime, and solutions to make even the largest challenges possible, Pressable is always there.',
			name: 'Justin Barrett',
			role: 'Director of Technology, Autoshop Solutions',
			linkLabel: 'autoshopsolutions.com',
			linkUrl: 'https://autoshopsolutions.com',
		},
	],
	vip: [
		{
			quote:
				'In the past, the staff didn’t touch the CMS. They wrote things in Word, sent it to the production team, and they put it online. With WordPress, that workflow is changing slowly and dramatically. We’ve trained many of our content creators in the CMS. And, the closer the content creators are to it, the more creatively they are able to think about it.',
			name: 'David Rousseau',
			role: 'Vice President, Kaiser Family Foundation',
			linkLabel: 'Read the case study',
			linkUrl:
				'https://wpvip.com/case-studies/evolving-the-kaiser-family-foundations-data-rich-platforms/',
		},
		{
			quote:
				'With Gutenberg, we were able to publish a breaking news story in two minutes versus five minutes in Classic [WordPress]. The main reason for this is the reusable blocks which have been renamed “The Game Changer.”',
			name: 'Joel Davies',
			role: 'Head of Editorial Operations, News UK',
			linkLabel: 'Read the case study',
			linkUrl:
				'https://wpvip.com/case-studies/behind-the-scenes-of-news-uks-rampant-speed-to-value-with-gutenberg/',
		},
	],
};

export const JETPACK_COMPLETE_FEATURES = [
	'VaultPress Backup w/ 1TB storage',
	'Scan w/ WAF',
	'Akismet Anti-spam w/ 60k API calls/mo',
	'Stats (Paid) w/ 100k views/mo',
	'VideoPress w/ 1TB storage',
	'Boost w/ Auto CSS Generation',
	'Social Advanced w/ unlimited shares',
	'Site Search up to 100k records and 100k requests/mo',
	'CRM Entrepreneur',
	'All Jetpack features',
];

export const VIP_PITCH_CAPABILITIES = [
	'Unmatched flexibility to build a customized web experience',
	'Tools to increase customer engagement',
	'Scalability to ensure top-notch site performance during campaigns or events',
];

export const VIP_CAPABILITIES = [
	'Rapid content authoring',
	'Experience creation',
	'Content guidance',
	'Headless CMS',
	'Development tools',
	'Scalable platform',
	'Enterprise-grade security',
	'Website management',
	'Integrated commerce',
];

export interface TieredPriceResult {
	basePerUnit: number;
	perUnit: number;
	actualCost: number;
	discountedCost: number;
	discountPercent: number;
}

/**
 * Owned units raise the discount tier ( production computes tiers on
 * quantity + ownedPlans ) but only the new quantity is charged.
 */
export function getTieredPrice(
	product: HostingProduct,
	quantity: number,
	term: 'monthly' | 'yearly',
	ownedUnits = 0
): TieredPriceResult {
	const basePerUnit = term === 'yearly' ? product.yearly_price : product.monthly_price;
	const ladder =
		( term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices ) ?? [];
	const tier = ladder.filter( ( t ) => t.units <= quantity + ownedUnits ).pop();
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
	term: 'monthly' | 'yearly',
	ownedUnits = 0
): { addMore: number; discountPercent: number } | null {
	const ladder =
		( term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices ) ?? [];
	const current = getTieredPrice( product, quantity, term, ownedUnits );
	const next = ladder.find(
		( t ) => t.units > quantity + ownedUnits && t.price < ( current.perUnit ?? Infinity )
	);
	if ( ! next ) {
		return null;
	}
	return {
		addMore: next.units - ( quantity + ownedUnits ),
		discountPercent: ( current.basePerUnit - next.price ) / current.basePerUnit,
	};
}

export function formatUSD( amount: number ): string {
	return `US$${ amount.toLocaleString( 'en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	} ) }`;
}

export function formatCompactNumber( value: number ): string {
	return value.toLocaleString( 'en-US', {
		notation: 'compact',
		maximumFractionDigits: 1,
	} );
}
