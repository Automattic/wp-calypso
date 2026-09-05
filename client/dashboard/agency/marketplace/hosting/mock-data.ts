import { createElement } from 'react';
/**
 * Prototype fallbacks and plan specs. Real prices (WordPress.com tiers and
 * Pressable term prices) come from the live `/agency/products` endpoint via
 * agencyTermProductsQuery; these values are only used if that call is
 * unavailable. Pressable plan specs (installs/visits/storage) mirror
 * production's PLAN_DATA, keyed by the real product slugs.
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
	/** Guidance label used on the selector tabs (mirrors Main's hero tabs). */
	tier: string;
	/** Main's hero-tab subtitle, for the two-line tab variant (?tabline). */
	tabSubtitle: string;
	/** Main's hero-tab subtitle, verbatim, plus one concrete sentence; shown beside the logo in the purchase card. */
	tierDescription: string;
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
	category: 'standard' | 'enterprise';
	yearly_price?: number;
	monthly_price?: number;
}

export const pressableStandardPlans: PressablePlan[] = [
	{
		slug: 'pressable-build',
		name: 'Build',
		install: 1,
		visits: 30000,
		storage: 20,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-growth',
		name: 'Growth',
		install: 3,
		visits: 50000,
		storage: 30,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-advanced',
		name: 'Advanced',
		install: 5,
		visits: 75000,
		storage: 35,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-pro',
		name: 'Pro',
		install: 10,
		visits: 150000,
		storage: 50,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-premium',
		name: 'Premium',
		install: 20,
		visits: 400000,
		storage: 80,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-business',
		name: 'Business',
		install: 50,
		visits: 1000000,
		storage: 200,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-business-80',
		name: 'Business 80',
		install: 80,
		visits: 1600000,
		storage: 275,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-business-100',
		name: 'Business 100',
		install: 100,
		visits: 2000000,
		storage: 325,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-business-120',
		name: 'Business 120',
		install: 120,
		visits: 2400000,
		storage: 375,
		worker: 10,
		category: 'standard',
	},
	{
		slug: 'pressable-business-150',
		name: 'Business 150',
		install: 150,
		visits: 3000000,
		storage: 450,
		worker: 10,
		category: 'standard',
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
		planSlug: 'pressable-advanced',
		usage: {
			sites: 4,
			visits: 62000,
			storageGB: 28,
		},
	},
};

export const pressableEnterprisePlans: PressablePlan[] = [
	{
		slug: 'pressable-enterprise-4',
		name: 'Enterprise 4',
		install: 200,
		visits: 4000000,
		storage: 500,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-5',
		name: 'Enterprise 5',
		install: 250,
		visits: 5000000,
		storage: 550,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-6',
		name: 'Enterprise 6',
		install: 300,
		visits: 6000000,
		storage: 600,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-7',
		name: 'Enterprise 7',
		install: 350,
		visits: 7000000,
		storage: 700,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-8',
		name: 'Enterprise 8',
		install: 400,
		visits: 8000000,
		storage: 800,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-9',
		name: 'Enterprise 9',
		install: 450,
		visits: 9000000,
		storage: 900,
		worker: 10,
		category: 'enterprise',
	},
	{
		slug: 'pressable-enterprise-10',
		name: 'Enterprise 10',
		install: 500,
		visits: 10000000,
		storage: 1000,
		worker: 10,
		category: 'enterprise',
	},
];

export const pressablePlans: PressablePlan[] = [
	...pressableStandardPlans,
	...pressableEnterprisePlans,
];

export const PRESSABLE_OVERAGES = {
	storagePerGB: 0.5,
	trafficPer10kVisits: 8,
};

export const hostingBrands: HostingBrand[] = [
	{
		key: 'wpcom',
		name: 'WordPress.com',
		tier: 'Standard Agency Hosting',
		tabSubtitle: 'Optimized and hassle-free hosting',
		tierDescription:
			'Optimized and hassle-free hosting. Managed WordPress priced per site, with volume discounts, staging, backups, and 24/7 expert support.',
		description: 'Per-site managed WordPress with staging, backups, and 24/7 expert support.',
		priceNote: 'From US$300 per site, per year',
		product: wpcomHosting,
	},
	{
		key: 'pressable',
		name: 'Pressable',
		tier: 'Premier Agency Hosting',
		tabSubtitle: 'Best for large-scale businesses',
		tierDescription:
			'Best for large-scale businesses. One pooled plan shares installs, traffic, and storage across your whole portfolio.',
		description: 'Pooled plans that share traffic and storage across your client portfolio.',
		priceNote: 'From US$250 per year',
	},
	{
		key: 'vip',
		name: 'WordPress VIP',
		tier: 'Enterprise',
		tabSubtitle: 'WordPress for enterprise-level demands',
		tierDescription:
			'WordPress for enterprise-level demands. Media, government, and mission-critical sites, with guided onboarding and dedicated support.',
		description: 'Enterprise-grade security, scale, and guided onboarding for high-stakes clients.',
		priceNote: 'Custom pricing',
	},
];

/**
 * The purchase-card blurb for a brand. With `?tabline` (Main's subtitle shown
 * under each tab) the blurb drops that sentence so it isn't said twice.
 */
export function brandBlurb( key: HostingBrand[ 'key' ] ): string {
	const brand = hostingBrands.find( ( b ) => b.key === key );
	if ( ! brand ) {
		return '';
	}
	const tabline = ! new URLSearchParams( window.location.search ).has( 'nolines' );
	return tabline
		? brand.tierDescription.replace( brand.tabSubtitle + '. ', '' )
		: brand.tierDescription;
}

/**
 * `?tabline` variant (Main's layout): the tabs carry the tier + subtitle and the
 * brand mark moves back down to the purchase-card header.
 */
export function tabLineMark( src: string ) {
	if ( new URLSearchParams( window.location.search ).has( 'nolines' ) ) {
		return undefined;
	}
	return createElement( 'img', { src, alt: '', className: 'marketplace-hosting__brand-mark' } );
}

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

// A compact volume-pricing table: the distinct discount tiers (site count →
// per-site price → % off), sampled to at most five rows for a clean display.
export function getVolumeTiers(
	product: HostingProduct,
	term: 'monthly' | 'yearly'
): { quantity: number; perUnit: number; percent: number }[] {
	const ladder =
		( term === 'yearly' ? product.tier_yearly_prices : product.tier_monthly_prices ) ?? [];
	const base = term === 'yearly' ? product.yearly_price : product.monthly_price;
	const seen = new Set< number >();
	const tiers: { quantity: number; perUnit: number; percent: number }[] = [];
	for ( const tier of ladder ) {
		const percent = Math.round( ( 1 - tier.price / base ) * 100 );
		if ( seen.has( percent ) ) {
			continue;
		}
		seen.add( percent );
		tiers.push( { quantity: tier.units, perUnit: tier.price, percent } );
	}
	if ( tiers.length <= 5 ) {
		return tiers;
	}
	// Keep the first (base) and last (max), sampling the rest evenly.
	const last = tiers.length - 1;
	const picks = [ 0, Math.round( last / 3 ), Math.round( ( 2 * last ) / 3 ), last ];
	return [ ...new Set( picks ) ].map( ( index ) => tiers[ index ] );
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

/** Referral commission on hosting, matching getProductCommissionPercentage. */
export const HOSTING_REFERRAL_COMMISSION_RATE = 0.2;

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
