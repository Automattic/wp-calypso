/**
 * Static plan data for the upgrade slide-over PROTOTYPE.
 *
 * Content mapped from the wordpress.com/pricing grid (July 2026 design):
 * prices, save percentages, taglines, and feature lists are verbatim.
 * Billing terms follow the checkout page (Monthly / 1 year / 2 years /
 * 3 years); the 2- and 3-year per-month prices use the same factors as
 * Business on the checkout reference (1yr x0.8 and 1yr x0.7).
 */

export type BillingCycleSlug = 'monthly' | 'yearly' | 'two-yearly' | 'three-yearly';

export interface BillingOption {
	slug: BillingCycleSlug;
	label: string;
	/** Price per month for this cycle, in EUR. */
	perMonth: number;
	/** What the user actually pays now, in EUR. */
	billedTotal: number;
	/** Human description of the charge, matching the pricing grid phrasing. */
	billedText: string;
	/** Discount vs monthly billing, e.g. "Save 55%". Empty for monthly. */
	saveBadge: string;
}

export interface PrototypePlan {
	slug: string;
	label: string;
	tagline: string;
	features: string[];
	billing: Record< BillingCycleSlug, BillingOption >;
}

function makeBilling(
	monthly: number,
	yearlyPerMonth: number,
	saveYearly: string
): Record< BillingCycleSlug, BillingOption > {
	const twoYearly = yearlyPerMonth * 0.8;
	const threeYearly = yearlyPerMonth * 0.7;
	const save = ( perMonth: number ) => `Save ${ Math.round( ( 1 - perMonth / monthly ) * 100 ) }%`;

	return {
		monthly: {
			slug: 'monthly',
			label: 'Monthly',
			perMonth: monthly,
			billedTotal: monthly,
			billedText: 'billed monthly',
			saveBadge: '',
		},
		yearly: {
			slug: 'yearly',
			label: '1 year',
			perMonth: yearlyPerMonth,
			billedTotal: yearlyPerMonth * 12,
			billedText: 'billed every 12 months',
			// The grid's official number (rounding differs slightly from ours).
			saveBadge: saveYearly,
		},
		'two-yearly': {
			slug: 'two-yearly',
			label: '2 years',
			perMonth: twoYearly,
			billedTotal: twoYearly * 24,
			billedText: 'billed every 24 months',
			saveBadge: save( twoYearly ),
		},
		'three-yearly': {
			slug: 'three-yearly',
			label: '3 years',
			perMonth: threeYearly,
			billedTotal: threeYearly * 36,
			billedText: 'billed every 36 months',
			saveBadge: save( threeYearly ),
		},
	};
}

export const PROTOTYPE_PLANS: PrototypePlan[] = [
	{
		slug: 'personal',
		label: 'WordPress.com Personal',
		tagline: 'Build your presence with a site you can customize.',
		features: [
			'6 GB storage',
			'Unlimited pages, posts, users, and visitors',
			'Free domain for one year',
			'No ads for visitors',
			'Guided website builder (usage limits apply)',
			'Dozens of premium themes',
			'Free support',
			'Extend your site with WordPress plugins',
		],
		billing: makeBilling( 9, 4, 'Save 55%' ),
	},
	{
		slug: 'premium',
		label: 'WordPress.com Premium',
		tagline: 'Accept payments on your site and reach more people.',
		features: [
			'13 GB storage',
			'Unlimited pages, posts, users, and visitors',
			'Free domain for one year',
			'No ads for visitors',
			'Create your site with a guided website builder',
			'All premium themes',
			'Free priority support',
			'Extend your site with WordPress plugins',
			'Premium stats and analytics',
			'Add payment buttons',
			'Advanced SEO tools',
			'Ad-free video hosting',
		],
		billing: makeBilling( 18, 8, 'Save 55%' ),
	},
	{
		slug: 'business',
		label: 'WordPress.com Business',
		tagline: 'Grow your business with powerful tools and priority support.',
		features: [
			'50 GB storage',
			'Unlimited pages, posts, users, and visitors',
			'Free domain for one year',
			'No ads for visitors',
			'Create your site with a guided website builder',
			'All premium themes',
			'Free 24/7 priority support',
			'Extend your site with WordPress plugins',
			'Premium stats and analytics',
			'Add payment buttons',
			'Advanced SEO tools',
			'Ad-free premium video hosting (250GB)',
			'Free business email for one year',
			'Built-in email marketing',
			'$200 in ad credits',
			'Real-time backups and one-click restores',
			'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments',
			'One-on-one onboarding call',
		],
		billing: makeBilling( 40, 25, 'Save 37%' ),
	},
	{
		slug: 'commerce',
		label: 'WordPress.com Commerce',
		tagline: 'Run an online store and keep more of what you earn.',
		features: [
			'50 GB storage',
			'Unlimited pages, posts, users, and visitors',
			'Free domain for one year',
			'No ads for visitors',
			'Create your site with a guided website builder',
			'Premium store themes',
			'Free 24/7 priority support',
			'Extend your site with WordPress plugins',
			'Premium stats and analytics',
			'Add payment buttons',
			'Advanced SEO tools',
			'Ad-free premium video hosting (250GB)',
			'Free business email for one year',
			'Built-in email marketing',
			'$200 in ad credits',
			'Real-time backups and one-click restores',
			'SFTP/SSH, WP-CLI, Git commands, and GitHub Deployments',
			'One-on-one onboarding call',
			'Ecommerce tools and WooCommerce experience',
			'Sell in 60+ countries',
		],
		billing: makeBilling( 70, 45, 'Save 35%' ),
	},
];

export const PAYMENT_METHODS = [ 'Credit card', 'PayPal', 'Apple Pay', 'Google Pay' ] as const;
export type PaymentMethod = ( typeof PAYMENT_METHODS )[ number ];

export const COUNTRIES = [
	'Spain',
	'United States',
	'United Kingdom',
	'Germany',
	'France',
	'Portugal',
	'Italy',
	'Netherlands',
];

export const TAX_ID_TYPES = [ 'EU VAT number', 'UK VAT number', 'US EIN', 'None' ];

export function getPrototypePlan( slug: string ): PrototypePlan {
	return PROTOTYPE_PLANS.find( ( plan ) => plan.slug === slug ) ?? PROTOTYPE_PLANS[ 0 ];
}

export function formatEuro( amount: number ): string {
	const rounded = Math.round( amount * 100 ) / 100;
	const text = Number.isInteger( rounded )
		? String( rounded )
		: rounded.toFixed( 2 ).replace( '.', ',' );
	return `€${ text }`;
}
