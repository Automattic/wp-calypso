import { __ } from '@wordpress/i18n';
import type { AgencyProduct } from '@automattic/api-core';

export const PLAN_CATEGORY_LEGACY_STANDARD = 'standard';
export const PLAN_CATEGORY_LEGACY_ENTERPRISE = 'enterprise';
export const PLAN_CATEGORY_STANDARD_TIER = 'signature';
export const PLAN_CATEGORY_AGENCY_TIER = 'signature-high';
export const PLAN_CATEGORY_PERFORMANCE_TIER = 'premium';
export const PRESSABLE_ADDON_CATEGORY = 'pressable-addon';

export type PressablePlanCategory =
	| typeof PLAN_CATEGORY_LEGACY_STANDARD
	| typeof PLAN_CATEGORY_LEGACY_ENTERPRISE
	| typeof PLAN_CATEGORY_STANDARD_TIER
	| typeof PLAN_CATEGORY_AGENCY_TIER
	| typeof PLAN_CATEGORY_PERFORMANCE_TIER
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
	PLAN_CATEGORY_LEGACY_STANDARD,
	PLAN_CATEGORY_LEGACY_ENTERPRISE,
	PLAN_CATEGORY_STANDARD_TIER,
	PLAN_CATEGORY_AGENCY_TIER,
	PLAN_CATEGORY_PERFORMANCE_TIER,
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

// The current catalog: Standard, Agency and Performance plans, as opposed to the legacy one.
export const isCurrentCatalogPlan = ( plan: PressablePlan ) =>
	plan.category === PLAN_CATEGORY_STANDARD_TIER ||
	plan.category === PLAN_CATEGORY_AGENCY_TIER ||
	plan.category === PLAN_CATEGORY_PERFORMANCE_TIER;

/** The plan name as shown on the page: "Pressable Signature 3" -> "Signature 3". */
export const getPressablePlanName = ( name: string ) => name.replace( /Pressable/g, '' ).trim();

export const isStandardTabCategory = ( category?: string ) =>
	category === PLAN_CATEGORY_LEGACY_STANDARD || category === PLAN_CATEGORY_STANDARD_TIER;

export const isAgencyTabCategory = ( category?: string ) =>
	category === PLAN_CATEGORY_LEGACY_ENTERPRISE || category === PLAN_CATEGORY_AGENCY_TIER;

// Agencies on a legacy plan keep seeing the legacy catalog; everyone else
// (including referrals) gets the current Standard, Agency and Performance plans.
export const isCurrentCatalogFor = (
	existingPlan: PressablePlan | undefined,
	isReferralMode: boolean
) =>
	isReferralMode ||
	! existingPlan ||
	existingPlan.category === PLAN_CATEGORY_STANDARD_TIER ||
	existingPlan.category === PLAN_CATEGORY_AGENCY_TIER;

export function getPlanCategoryTabs( isCurrentCatalog: boolean ) {
	return [
		...( isCurrentCatalog
			? [
					{
						key: PLAN_CATEGORY_STANDARD_TIER,
						label: __( 'Standard plans' ),
						description: __(
							'Traffic and storage pooled across all your client sites, from 1 to 10 installs.'
						),
					},
					{
						key: PLAN_CATEGORY_AGENCY_TIER,
						label: __( 'Agency plans' ),
						description: __( 'For growing portfolios of 20 to 500 WordPress installs.' ),
					},
				]
			: [
					{
						key: PLAN_CATEGORY_LEGACY_STANDARD,
						label: __( 'Signature plans' ),
						description: __(
							'Traffic and storage pooled across all your client sites, from 1 to 150 installs.'
						),
					},
					{
						key: PLAN_CATEGORY_LEGACY_ENTERPRISE,
						label: __( 'Enterprise plans' ),
						description: __( 'For large portfolios of 200 to 500 WordPress installs.' ),
					},
				] ),
		{
			key: PLAN_CATEGORY_PERFORMANCE_TIER,
			label: __( 'Performance plans' ),
			description: __(
				'Dedicated resources for one high-traffic site, from 150K to 10M visits per month.'
			),
		},
	];
}

// The tab an existing plan belongs to, mapped across the legacy and current catalogs.
export function getDefaultPlanCategoryTab(
	existingPlan: PressablePlan | undefined,
	isCurrentCatalog: boolean
): string {
	if ( ! existingPlan ) {
		return isCurrentCatalog ? PLAN_CATEGORY_STANDARD_TIER : PLAN_CATEGORY_LEGACY_STANDARD;
	}
	if ( isCurrentCatalog ) {
		if ( existingPlan.category === PLAN_CATEGORY_LEGACY_STANDARD ) {
			return PLAN_CATEGORY_STANDARD_TIER;
		}
		if ( existingPlan.category === PLAN_CATEGORY_LEGACY_ENTERPRISE ) {
			return PLAN_CATEGORY_AGENCY_TIER;
		}
	} else if ( existingPlan.category === PLAN_CATEGORY_STANDARD_TIER ) {
		return PLAN_CATEGORY_LEGACY_STANDARD;
	} else if ( existingPlan.category === PLAN_CATEGORY_AGENCY_TIER ) {
		return PLAN_CATEGORY_LEGACY_ENTERPRISE;
	}
	return existingPlan.category;
}

// Plans in a category, in the order the classic slider shows them.
export function sortPlansForCategory( plans: PressablePlan[], category: string ): PressablePlan[] {
	return plans
		.filter( ( entry ) => entry.category === category )
		.sort( ( a, b ) =>
			category === PLAN_CATEGORY_PERFORMANCE_TIER ? a.visits - b.visits : a.install - b.install
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
	if ( isStandardTabCategory( category ) && ! isStandardTabCategory( existingPlan.category ) ) {
		return options.length - 1;
	}
	if ( isAgencyTabCategory( category ) && ! isAgencyTabCategory( existingPlan.category ) ) {
		return 0;
	}
	if ( existingPlan.category === PLAN_CATEGORY_PERFORMANCE_TIER ) {
		const index = options.findIndex( ( option ) => existingPlan.storage < option.storage );
		return index >= 0 ? index : options.length;
	}
	const index = options.findIndex( ( option ) => existingPlan.install < option.install );
	return index >= 0 ? index : options.length;
}

// The Standard tab is closed once the agency is already on its highest plan or above.
export function isStandardTabClosed(
	existingPlan: PressablePlan | undefined,
	standardTabOptions: PressablePlan[]
): boolean {
	if ( ! existingPlan ) {
		return false;
	}
	return (
		! isStandardTabCategory( existingPlan.category ) ||
		existingPlan.slug === standardTabOptions[ standardTabOptions.length - 1 ]?.slug
	);
}

export const PRESSABLE_PROMOTION_TERMS_URL = 'https://pressable.com/legal/hosting-promotion-terms/';

// Pressable renamed Signature and Premium to Standard, Agency and Performance on 2026-10-07.
// After this date, the "renamed plan" note is no longer shown.
export const PRESSABLE_PLAN_RENAME_NOTE_END_DATE = new Date( '2027-01-07T00:00:00Z' );

const RENAMED_PLAN_SLUG = /^pressable-(signature|premium)-(\d+)$/;

const RENAMED_TIERS: Record< string, { formerName: string; lastTier: number } > = {
	signature: { formerName: 'Pressable Signature', lastTier: 17 },
	premium: { formerName: 'Pressable Premium', lastTier: 11 },
};

/**
 * The name a renamed plan had before the rename, e.g. "Pressable Signature 2", or undefined
 * when there is nothing to explain: the plan was not renamed (including the legacy bare
 * `pressable-premium`), the products API still returns the old name, or the note has expired.
 */
export function getPressablePlanRenameNote(
	product: Pick< AgencyProduct, 'slug' | 'name' >,
	now: Date = new Date()
): string | undefined {
	const match = product.slug.match( RENAMED_PLAN_SLUG );
	if ( ! match || now >= PRESSABLE_PLAN_RENAME_NOTE_END_DATE ) {
		return undefined;
	}
	const { formerName, lastTier } = RENAMED_TIERS[ match[ 1 ] ];
	const tier = Number( match[ 2 ] );
	if ( tier < 1 || tier > lastTier ) {
		return undefined;
	}
	const name = `${ formerName } ${ tier }`;
	return name !== product.name ? name : undefined;
}
