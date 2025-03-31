import { Plans, AddOns, PlanPricing } from '@automattic/data-stores';
import type {
	UrlFriendlyTermType,
	PlanSlug,
	FeatureList,
	FeatureObject,
	FeatureGroupMap,
	Feature,
} from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { TranslateResult } from 'i18n-calypso';

/******************
 * Grid Plan Types:
 ******************/

export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
	isHighlighted?: boolean;
};

export interface PlanFeaturesForGridPlan {
	wpcomFeatures: TransformedFeatureObject[];
	jetpackFeatures: TransformedFeatureObject[];
	storageFeature?: FeatureObject;
	// used for comparison grid so far
	comparisonGridFeatureLabels?: Record< Feature, TranslateResult >;
}

export interface GridPlan {
	planSlug: PlanSlug;
	freeTrialPlanSlug?: PlanSlug;
	isVisible: boolean;
	features: PlanFeaturesForGridPlan;
	tagline: TranslateResult;
	planTitle: TranslateResult;
	availableForPurchase: boolean;
	pricing: Plans.PricingMetaForGridPlan;
	productNameShort?: string | null;
	billingTimeframe?: TranslateResult | null;
	current?: boolean;
	isMonthlyPlan?: boolean;
	cartItemForPlan?: {
		product_slug: string;
	} | null;
	highlightLabel?: React.ReactNode | null;
}

/***********************
 * Grid Component Types:
 ***********************/

export type GridSize = 'small' | 'smedium' | 'medium' | 'large' | 'xlarge';

export type PlansIntent =
	| 'plans-affiliate'
	| 'plans-blog-onboarding'
	| 'plans-newsletter'
	| 'plans-new-hosted-site'
	| 'plans-new-hosted-site-business-only'
	| 'plans-plugins'
	| 'plans-jetpack-app'
	| 'plans-jetpack-app-site-creation'
	| 'plans-import'
	| 'plans-woocommerce'
	| 'plans-p2'
	| 'plans-default-wpcom'
	| 'plans-business-trial'
	| 'plans-videopress'
	| 'plans-guided-segment-developer-or-agency'
	| 'plans-guided-segment-merchant'
	| 'plans-guided-segment-blogger'
	| 'plans-guided-segment-nonprofit'
	| 'plans-guided-segment-consumer-or-business'
	| 'plans-site-selected-legacy'
	| 'default';

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		text?: TranslateResult;
		status?: 'blocked' | 'enabled';
	};
	currentPlan?: {
		text?: TranslateResult;
	};
	trialAlreadyUsed?: {
		postButtonText?: TranslateResult;
	};
}

// A generic type representing the response of an async request.
// It's probably generic enough to be put outside of the pricing grid package,
// but at the moment it's located here to reduce its scope of influence.
export type DataResponse< T > = {
	isLoading: boolean;
	result?: T;
};

export interface CommonGridProps {
	/**
	 * Site id may not be used in ComparisonGrid, but need to be investigated further
	 */
	siteId?: number | null;
	isInSignup: boolean;
	isInAdmin: boolean;
	isInSiteDashboard: boolean;
	onStorageAddOnClick?: ( addOnSlug: AddOns.StorageAddOnSlug ) => void;
	currentSitePlanSlug?: PlanSlug | null;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	showRefundPeriod?: boolean;
	// only used for comparison grid
	planTypeSelectorProps?: PlanTypeSelectorProps;
	gridContainerRef?: React.MutableRefObject< HTMLDivElement | null >;
	gridSize?: GridSize;
}

export interface FeaturesGridProps extends CommonGridProps {
	gridPlans: GridPlan[];
	currentPlanManageHref?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	isCustomDomainAllowedOnFreePlan: boolean; // indicate when a custom domain is allowed to be used with the Free plan.
	paidDomainName?: string;
	showLegacyStorageFeature: boolean;
	enableShowAllFeaturesButton?: boolean;
}

export interface ComparisonGridProps extends CommonGridProps {
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	intervalType: SupportedUrlFriendlyTermType;
}

export type UseActionCallback = ( {
	planSlug,
	cartItemForPlan,
	selectedStorageAddOn,
	availableForPurchase,
}: {
	planSlug: PlanSlug;
	cartItemForPlan?: MinimalRequestCartProduct | null;
	selectedStorageAddOn?: AddOns.AddOnMeta | null;
	availableForPurchase?: boolean;
} ) => () => Promise< void > | void;

export interface GridAction {
	primary: {
		text: TranslateResult;
		callback: () => Promise< void > | void;
		// TODO: It's not clear if status is ever actually set to 'blocked'. Investigate and remove if not.
		status?: 'disabled' | 'blocked' | 'enabled';
		variant?: 'primary' | 'secondary';
	};
	postButtonText?: TranslateResult;
}

export type UseAction = ( {
	availableForPurchase,
	billingPeriod,
	cartItemForPlan,
	currentPlanBillingPeriod,
	isFreeTrialAction,
	isLargeCurrency,
	isStuck,
	planSlug,
	planTitle,
	priceString,
	selectedStorageAddOn,
}: {
	availableForPurchase?: boolean;
	billingPeriod?: PlanPricing[ 'billPeriod' ];
	cartItemForPlan?: MinimalRequestCartProduct | null;
	currentPlanBillingPeriod?: PlanPricing[ 'billPeriod' ];
	isFreeTrialAction?: boolean;
	isLargeCurrency?: boolean;
	isStuck?: boolean;
	planSlug: PlanSlug;
	planTitle?: TranslateResult;
	priceString?: string;
	selectedStorageAddOn?: AddOns.AddOnMeta | null;
} ) => GridAction;

export type GridContextProps = {
	gridPlans: GridPlan[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	siteId?: number | null;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	useAction: UseAction;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	children: React.ReactNode;
	coupon?: string;
	enableFeatureTooltips?: boolean;
	featureGroupMap: Partial< FeatureGroupMap >;
	hideUnsupportedFeatures?: boolean;
	enterpriseFeaturesList?: string[];

	/**
	 * `enableCategorisedFeatures` is no longer exact, and probably best to rename.
	 * It is only used for showing "Everything in [previous] plus".
	 */
	enableCategorisedFeatures?: boolean;

	/**
	 * Display the plan storage limit as a badge like "50GB" or as plain text like "50GB storage"
	 */
	enableStorageAsBadge?: boolean;

	/**
	 * Reduce the vertical spacing between each feature group
	 */
	enableReducedFeatureGroupSpacing?: boolean;

	/**
	 * Display only the client logos for the enterprise plan
	 */
	enableLogosOnlyForEnterprisePlan?: boolean;

	/**
	 * Hide the titles for feature groups in the features grid
	 */
	hideFeatureGroupTitles?: boolean;

	/**
	 * Enable the display of the term savings in plan prices.
	 * Prices will display crossed out with the savings from shorter term accentuated in a label.
	 * This carries lower precedence than promo/coupon and introductory pricing, irrespective of whether set or not.
	 */
	enableTermSavingsPriceDisplay?: boolean;

	/**
	 * Determine if storage add-on products should be combined with plan costs when
	 * calculating prices.
	 */
	reflectStorageSelectionInPlanPrices?: boolean;
};

export type ComparisonGridExternalProps = Omit<
	GridContextProps,
	'children' | 'enableCategorisedFeatures'
> &
	Omit< ComparisonGridProps, 'onUpgradeClick' | 'gridContainerRef' | 'gridSize' > & {
		className?: string;
		onUpgradeClick?: (
			cartItems?: MinimalRequestCartProduct[] | null,
			clickedPlanSlug?: PlanSlug
		) => void;
	};

export type FeaturesGridExternalProps = Omit< GridContextProps, 'children' | 'featureGroupMap' > &
	Omit<
		FeaturesGridProps,
		'onUpgradeClick' | 'isLargeCurrency' | 'translate' | 'gridContainerRef' | 'gridSize'
	> & {
		className?: string;
		onUpgradeClick?: (
			cartItems?: MinimalRequestCartProduct[] | null,
			clickedPlanSlug?: PlanSlug
		) => void;
		featureGroupMap?: Partial< FeatureGroupMap >; // make it optional for Features Grid
	};

/************************
 * PlanTypeSelector Types:
 ************************/

export type PlanTypeSelectorProps = {
	kind: 'interval';
	siteId?: number | null;
	basePlansPath?: string | null;
	intervalType: UrlFriendlyTermType;
	customerType: string;
	enableStickyBehavior?: boolean;
	stickyPlanTypeSelectorOffset?: number;
	onPlanIntervalUpdate: ( interval: SupportedUrlFriendlyTermType ) => void;
	layoutClassName?: string;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	showPlanTypeSelectorDropdown?: boolean; // feature flag used for the plan selector dropdown
	isInSignup: boolean;
	plans: PlanSlug[];
	eligibleForWpcomMonthlyPlans?: boolean;
	hideDiscount?: boolean;
	redirectTo?: string | null;
	isStepperUpgradeFlow: boolean;
	currentSitePlanSlug?: PlanSlug | null;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	/**
	 * Whether to render the selector along with a title if passed.
	 */
	title?: TranslateResult;
	/**
	 * Coupon code for use in pricing hook usage.
	 */
	coupon?: string;
	displayedIntervals: UrlFriendlyTermType[];
	intent?: PlansIntent | null;
};

export type IntervalTypeProps = Pick<
	PlanTypeSelectorProps,
	| 'intervalType'
	| 'siteId'
	| 'displayedIntervals'
	| 'plans'
	| 'isInSignup'
	| 'eligibleForWpcomMonthlyPlans'
	| 'hideDiscount'
	| 'redirectTo'
	| 'showPlanTypeSelectorDropdown'
	| 'selectedPlan'
	| 'selectedFeature'
	| 'currentSitePlanSlug'
	| 'useCheckPlanAvailabilityForPurchase'
	| 'title'
	| 'coupon'
	| 'onPlanIntervalUpdate'
	| 'intent'
>;

export type SupportedUrlFriendlyTermType = Extract<
	UrlFriendlyTermType,
	'yearly' | '2yearly' | '3yearly' | 'monthly'
>;

export type HiddenPlans = {
	hideFreePlan?: boolean;
	hidePersonalPlan?: boolean;
	hidePremiumPlan?: boolean;
	hideBusinessPlan?: boolean;
	hideEcommercePlan?: boolean;
	hideEnterprisePlan?: boolean;
};
