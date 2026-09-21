import { __ } from '@wordpress/i18n';
import type { AgencyProduct } from '@automattic/api-core';

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
	category: PressablePlanCategory;
	install: number;
	visits: number;
	storage: number;
	worker: number;
}

const PLAN_CATEGORIES: string[] = [
	PLAN_CATEGORY_STANDARD,
	PLAN_CATEGORY_ENTERPRISE,
	PLAN_CATEGORY_SIGNATURE,
	PLAN_CATEGORY_SIGNATURE_HIGH,
	PLAN_CATEGORY_PREMIUM,
	PRESSABLE_ADDON_CATEGORY,
];

/** The plan limits the products API sends with each Pressable product. */
export function getPressablePlanInfo( product: AgencyProduct ): PressablePlan | undefined {
	const metadata = product.metadata;
	if ( ! metadata || ! PLAN_CATEGORIES.includes( metadata.category ) ) {
		return undefined;
	}
	return {
		slug: product.slug,
		category: metadata.category as PressablePlanCategory,
		install: metadata.sites,
		visits: metadata.visits,
		storage: metadata.storage,
		worker: metadata.php_worker_count,
	};
}

export const isPressableHostingProduct = ( keyOrSlug: string ) =>
	keyOrSlug.startsWith( 'pressable-' ) || keyOrSlug.startsWith( 'jetpack-pressable' );

export const isPressableAddonProduct = ( keyOrSlug: string ) =>
	keyOrSlug.startsWith( 'pressable-addon' );

// The Signature catalog: Signature and Premium plans, as opposed to the legacy one.
export const isSignatureCatalogPlan = ( plan: PressablePlan ) =>
	plan.category === PLAN_CATEGORY_SIGNATURE ||
	plan.category === PLAN_CATEGORY_SIGNATURE_HIGH ||
	plan.category === PLAN_CATEGORY_PREMIUM;

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
