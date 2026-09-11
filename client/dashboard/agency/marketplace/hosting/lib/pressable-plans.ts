import { __ } from '@wordpress/i18n';

export const PLAN_CATEGORY_STANDARD = 'standard';
export const PLAN_CATEGORY_ENTERPRISE = 'enterprise';
export const PLAN_CATEGORY_SIGNATURE = 'signature';
export const PLAN_CATEGORY_SIGNATURE_HIGH = 'signature-high';
export const PLAN_CATEGORY_PREMIUM = 'premium';
export const PRESSABLE_ADDON_CATEGORY = 'pressable-addon';

export type PressablePlanCategory =
	| typeof PLAN_CATEGORY_STANDARD
	| typeof PLAN_CATEGORY_ENTERPRISE
	| typeof PLAN_CATEGORY_SIGNATURE
	| typeof PLAN_CATEGORY_SIGNATURE_HIGH
	| typeof PLAN_CATEGORY_PREMIUM
	| typeof PRESSABLE_ADDON_CATEGORY;

export interface PressablePlan {
	slug: string;
	install: number;
	visits: number;
	storage: number;
	category: PressablePlanCategory;
	worker?: number;
	phpMemory?: number;
	unit?: string;
}

const plan = (
	slug: string,
	category: PressablePlanCategory,
	install: number,
	visits: number,
	storage: number,
	worker: number
): PressablePlan => ( { slug, category, install, visits, storage, worker } );

const addon = (
	slug: string,
	install: number,
	visits: number,
	storage: number,
	extra: Partial< PressablePlan > = {}
): PressablePlan => ( {
	slug,
	category: PRESSABLE_ADDON_CATEGORY,
	install,
	visits,
	storage,
	...extra,
} );

// The plan limits are not part of the products API; this mirrors the classic
// dashboard's catalog, keyed by product slug (and by add-on license key).
const PLANS: PressablePlan[] = [
	// [Legacy] Old Pressable plans
	plan( 'pressable-wp-1', PLAN_CATEGORY_STANDARD, 1, 50000, 20, 10 ),
	plan( 'pressable-wp-2', PLAN_CATEGORY_STANDARD, 5, 100000, 50, 10 ),
	plan( 'pressable-wp-3', PLAN_CATEGORY_STANDARD, 10, 250000, 80, 10 ),
	plan( 'pressable-wp-4', PLAN_CATEGORY_STANDARD, 25, 500000, 175, 10 ),
	plan( 'pressable-wp-5', PLAN_CATEGORY_STANDARD, 50, 1000000, 250, 10 ),
	plan( 'pressable-wp-6', PLAN_CATEGORY_STANDARD, 75, 1500000, 350, 10 ),
	plan( 'pressable-wp-7', PLAN_CATEGORY_STANDARD, 100, 2000000, 500, 10 ),
	// [Legacy] Pressable plans 2024-08
	plan( 'pressable-build', PLAN_CATEGORY_STANDARD, 1, 30000, 20, 10 ),
	plan( 'pressable-growth', PLAN_CATEGORY_STANDARD, 3, 50000, 30, 10 ),
	plan( 'pressable-advanced', PLAN_CATEGORY_STANDARD, 5, 75000, 35, 10 ),
	plan( 'pressable-pro', PLAN_CATEGORY_STANDARD, 10, 150000, 50, 10 ),
	plan( 'pressable-premium', PLAN_CATEGORY_STANDARD, 20, 400000, 80, 10 ),
	plan( 'pressable-business', PLAN_CATEGORY_STANDARD, 50, 1000000, 200, 10 ),
	plan( 'pressable-business-80', PLAN_CATEGORY_STANDARD, 80, 1600000, 275, 10 ),
	plan( 'pressable-business-100', PLAN_CATEGORY_STANDARD, 100, 2000000, 325, 10 ),
	plan( 'pressable-business-120', PLAN_CATEGORY_STANDARD, 120, 2400000, 375, 10 ),
	plan( 'pressable-business-150', PLAN_CATEGORY_STANDARD, 150, 3000000, 450, 10 ),
	// [Legacy] Pressable Enterprise plans 2024-08
	plan( 'pressable-enterprise-4', PLAN_CATEGORY_ENTERPRISE, 200, 4000000, 500, 10 ),
	plan( 'pressable-enterprise-5', PLAN_CATEGORY_ENTERPRISE, 250, 5000000, 550, 10 ),
	plan( 'pressable-enterprise-6', PLAN_CATEGORY_ENTERPRISE, 300, 6000000, 600, 10 ),
	plan( 'pressable-enterprise-7', PLAN_CATEGORY_ENTERPRISE, 350, 7000000, 700, 10 ),
	plan( 'pressable-enterprise-8', PLAN_CATEGORY_ENTERPRISE, 400, 8000000, 800, 10 ),
	plan( 'pressable-enterprise-9', PLAN_CATEGORY_ENTERPRISE, 450, 9000000, 900, 10 ),
	plan( 'pressable-enterprise-10', PLAN_CATEGORY_ENTERPRISE, 500, 10000000, 1000, 10 ),
	// Pressable Signature plans 2025-06
	plan( 'pressable-signature-1', PLAN_CATEGORY_SIGNATURE, 1, 30000, 20, 5 ),
	plan( 'pressable-signature-2', PLAN_CATEGORY_SIGNATURE, 3, 50000, 30, 5 ),
	plan( 'pressable-signature-3', PLAN_CATEGORY_SIGNATURE, 5, 75000, 35, 5 ),
	plan( 'pressable-signature-4', PLAN_CATEGORY_SIGNATURE, 10, 150000, 50, 5 ),
	plan( 'pressable-signature-5', PLAN_CATEGORY_SIGNATURE, 20, 400000, 80, 5 ),
	plan( 'pressable-signature-6', PLAN_CATEGORY_SIGNATURE, 50, 1000000, 200, 5 ),
	plan( 'pressable-signature-7', PLAN_CATEGORY_SIGNATURE, 80, 1600000, 275, 5 ),
	plan( 'pressable-signature-8', PLAN_CATEGORY_SIGNATURE, 100, 2000000, 325, 5 ),
	plan( 'pressable-signature-9', PLAN_CATEGORY_SIGNATURE, 120, 2400000, 375, 5 ),
	plan( 'pressable-signature-10', PLAN_CATEGORY_SIGNATURE, 150, 3000000, 450, 5 ),
	plan( 'pressable-signature-11', PLAN_CATEGORY_SIGNATURE_HIGH, 200, 4000000, 500, 5 ),
	plan( 'pressable-signature-12', PLAN_CATEGORY_SIGNATURE_HIGH, 250, 5000000, 550, 5 ),
	plan( 'pressable-signature-13', PLAN_CATEGORY_SIGNATURE_HIGH, 300, 6000000, 600, 5 ),
	plan( 'pressable-signature-14', PLAN_CATEGORY_SIGNATURE_HIGH, 350, 7000000, 700, 5 ),
	plan( 'pressable-signature-15', PLAN_CATEGORY_SIGNATURE_HIGH, 400, 8000000, 800, 5 ),
	plan( 'pressable-signature-16', PLAN_CATEGORY_SIGNATURE_HIGH, 450, 9000000, 900, 5 ),
	plan( 'pressable-signature-17', PLAN_CATEGORY_SIGNATURE_HIGH, 500, 10000000, 1000, 5 ),
	// Pressable Premium plans 2026-02
	plan( 'pressable-premium-1', PLAN_CATEGORY_PREMIUM, 1, 150000, 30, 10 ),
	plan( 'pressable-premium-2', PLAN_CATEGORY_PREMIUM, 1, 250000, 40, 10 ),
	plan( 'pressable-premium-3', PLAN_CATEGORY_PREMIUM, 1, 350000, 50, 13 ),
	plan( 'pressable-premium-4', PLAN_CATEGORY_PREMIUM, 1, 500000, 60, 15 ),
	plan( 'pressable-premium-5', PLAN_CATEGORY_PREMIUM, 1, 750000, 70, 15 ),
	plan( 'pressable-premium-6', PLAN_CATEGORY_PREMIUM, 1, 1000000, 80, 17 ),
	plan( 'pressable-premium-7', PLAN_CATEGORY_PREMIUM, 1, 2000000, 90, 17 ),
	plan( 'pressable-premium-8', PLAN_CATEGORY_PREMIUM, 1, 3000000, 100, 20 ),
	plan( 'pressable-premium-9', PLAN_CATEGORY_PREMIUM, 1, 5000000, 125, 20 ),
	plan( 'pressable-premium-10', PLAN_CATEGORY_PREMIUM, 1, 7000000, 150, 25 ),
	plan( 'pressable-premium-11', PLAN_CATEGORY_PREMIUM, 1, 10000000, 175, 25 ),
	// Add-on capacity, by Pressable key and by the A4A license key alias.
	addon( 'site_addon_1', 1, 10000, 10 ),
	addon( 'site_addon_5', 5, 50000, 20 ),
	addon( 'site_addon_10', 10, 100000, 20 ),
	addon( 'visits_addon_10k', 0, 10000, 0 ),
	addon( 'storage_addon_1gb', 0, 0, 1 ),
	addon( 'titan_addon', 0, 0, 0, { unit: 'inbox' } ),
	addon( 'pressable-addon-sites-1', 1, 10000, 10 ),
	addon( 'pressable-addon-sites-5', 5, 50000, 20 ),
	addon( 'pressable-addon-sites-10', 10, 100000, 20 ),
	addon( 'pressable-addon-visits-10k', 0, 10000, 0 ),
	addon( 'pressable-addon-storage-1gb', 0, 0, 1 ),
	addon( 'pressable-addon-storage-2gb', 0, 0, 2 ),
	addon( 'pressable-addon-storage-4gb', 0, 0, 4 ),
	addon( 'pressable-addon-storage-8gb', 0, 0, 8 ),
	addon( 'pressable-addon-storage-16gb', 0, 0, 16 ),
	addon( 'pressable-addon-storage-32gb', 0, 0, 32 ),
	addon( 'pressable-addon-storage-64gb', 0, 0, 64 ),
	addon( 'pressable-addon-php-memory-512mb', 0, 0, 0, { phpMemory: 512 } ),
];

const PLAN_DATA: Record< string, PressablePlan > = Object.fromEntries(
	PLANS.map( ( entry ) => [ entry.slug, entry ] )
);

export function getPressablePlan( slug: string ): PressablePlan | undefined {
	return PLAN_DATA[ slug ];
}

export const isPressableHostingProduct = ( keyOrSlug: string ) =>
	keyOrSlug.startsWith( 'pressable-' ) || keyOrSlug.startsWith( 'jetpack-pressable' );

export const isPressableAddonProduct = ( keyOrSlug: string ) =>
	keyOrSlug.startsWith( 'pressable-addon' );

export const isPremiumPlanSlug = ( slug: string ) => slug.startsWith( 'pressable-premium-' );

export const isSignaturePlanSlug = ( slug: string ) =>
	slug.startsWith( 'pressable-signature-' ) || isPremiumPlanSlug( slug );

/** The plan name as shown on the page: "Pressable Signature 3" -> "Signature 3". */
export const getPressablePlanName = ( name: string ) => name.replace( /Pressable/g, '' ).trim();

export const isLowPlanCategory = ( category?: string ) =>
	category === PLAN_CATEGORY_STANDARD || category === PLAN_CATEGORY_SIGNATURE;

export const isHighPlanCategory = ( category?: string ) =>
	category === PLAN_CATEGORY_ENTERPRISE || category === PLAN_CATEGORY_SIGNATURE_HIGH;

// Agencies on a legacy plan keep seeing the legacy catalog; everyone else
// (including referrals) gets the Signature and Premium plans.
export const areSignaturePlansFor = (
	existingPlan: PressablePlan | undefined,
	isReferralMode: boolean
) =>
	isReferralMode ||
	! existingPlan ||
	existingPlan.category === PLAN_CATEGORY_SIGNATURE ||
	existingPlan.category === PLAN_CATEGORY_SIGNATURE_HIGH;

export function getPlanCategoryTabs( areSignaturePlans: boolean, hasNewPremiumPlans: boolean ) {
	const pooled = __(
		'Traffic and storage pooled across all your client sites, from 1 to 150 installs.'
	);
	const large = __( 'For large portfolios of 200 to 500 WordPress installs.' );
	return [
		...( areSignaturePlans
			? [
					{
						key: PLAN_CATEGORY_SIGNATURE,
						label: __( 'Signature plans 1–10' ),
						description: pooled,
					},
					{
						key: PLAN_CATEGORY_SIGNATURE_HIGH,
						label: __( 'Signature plans 11–17' ),
						description: large,
					},
			  ]
			: [
					{ key: PLAN_CATEGORY_STANDARD, label: __( 'Signature plans' ), description: pooled },
					{ key: PLAN_CATEGORY_ENTERPRISE, label: __( 'Enterprise plans' ), description: large },
			  ] ),
		{
			key: PLAN_CATEGORY_PREMIUM,
			label: hasNewPremiumPlans ? __( 'Premium plans 1–11' ) : __( 'Premium plans' ),
			description: __(
				'Dedicated resources for one high-traffic site, from 150K to 10M visits per month.'
			),
		},
	];
}

// The tab an existing plan belongs to, mapped across the legacy/Signature catalogs.
export function getDefaultPlanCategoryTab(
	existingPlan: PressablePlan | undefined,
	areSignaturePlans: boolean
): string {
	if ( ! existingPlan ) {
		return areSignaturePlans ? PLAN_CATEGORY_SIGNATURE : PLAN_CATEGORY_STANDARD;
	}
	if ( areSignaturePlans ) {
		if ( existingPlan.category === PLAN_CATEGORY_STANDARD ) {
			return PLAN_CATEGORY_SIGNATURE;
		}
		if ( existingPlan.category === PLAN_CATEGORY_ENTERPRISE ) {
			return PLAN_CATEGORY_SIGNATURE_HIGH;
		}
	} else if ( existingPlan.category === PLAN_CATEGORY_SIGNATURE ) {
		return PLAN_CATEGORY_STANDARD;
	} else if ( existingPlan.category === PLAN_CATEGORY_SIGNATURE_HIGH ) {
		return PLAN_CATEGORY_ENTERPRISE;
	}
	return existingPlan.category;
}

export function getDefaultPlanSlug( tab: string, areSignaturePlans: boolean ): string {
	if ( tab === PLAN_CATEGORY_SIGNATURE_HIGH || tab === PLAN_CATEGORY_ENTERPRISE ) {
		return areSignaturePlans ? 'pressable-signature-11' : 'pressable-enterprise-1';
	}
	if ( tab === PLAN_CATEGORY_PREMIUM ) {
		return 'pressable-premium-1';
	}
	return areSignaturePlans ? 'pressable-signature-1' : 'pressable-build';
}

// Plans in a category, in the order the classic slider shows them.
export function sortPlansForCategory( plans: PressablePlan[], category: string ): PressablePlan[] {
	return plans
		.filter( ( entry ) => entry.category === category )
		.sort( ( a, b ) =>
			category === PLAN_CATEGORY_PREMIUM ? a.visits - b.visits : a.install - b.install
		);
}

// With an existing plan, only plans above it can be picked. Returns the index of
// the first selectable plan in the category's list, or the list length when none is.
export function getMinimumSelectableIndex(
	category: string,
	options: PressablePlan[],
	existingPlan: PressablePlan | undefined
): number {
	if ( ! existingPlan ) {
		return 0;
	}
	if ( isLowPlanCategory( category ) && ! isLowPlanCategory( existingPlan.category ) ) {
		return options.length - 1;
	}
	if ( isHighPlanCategory( category ) && ! isHighPlanCategory( existingPlan.category ) ) {
		return 0;
	}
	if ( existingPlan.category === PLAN_CATEGORY_PREMIUM ) {
		const index = options.findIndex( ( option ) => existingPlan.storage < option.storage );
		return index >= 0 ? index : options.length;
	}
	const index = options.findIndex( ( option ) => existingPlan.install < option.install );
	return index >= 0 ? index : options.length;
}

// The low tab is closed once the agency is already on its highest plan or above.
export function isLowTabDisabled(
	existingPlan: PressablePlan | undefined,
	lowOptions: PressablePlan[]
): boolean {
	if ( ! existingPlan ) {
		return false;
	}
	return (
		! isLowPlanCategory( existingPlan.category ) ||
		existingPlan.slug === lowOptions[ lowOptions.length - 1 ]?.slug
	);
}

export const PRESSABLE_PROMOTION_TERMS_URL = 'https://pressable.com/legal/hosting-promotion-terms/';
