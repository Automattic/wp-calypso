import { Plans, AddOns } from '@automattic/data-stores';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type {
	UrlFriendlyTermType,
	PlanSlug,
	FeatureList,
	WPComStorageAddOnSlug,
	FeatureObject,
	StorageOption,
	FeatureGroupMap,
} from '@automattic/calypso-products';
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
	storageOptions: StorageOption[];
	// used for comparison grid so far
	conditionalFeatures?: FeatureObject[];
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
	storageAddOnsForPlan: ( AddOns.AddOnMeta | null )[] | null;
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

export type GridSize = 'small' | 'medium' | 'large';

export type PlansIntent =
	| 'plans-blog-onboarding'
	| 'plans-newsletter'
	| 'plans-link-in-bio'
	| 'plans-new-hosted-site'
	| 'plans-plugins'
	| 'plans-jetpack-app'
	| 'plans-jetpack-app-site-creation'
	| 'plans-import'
	| 'plans-woocommerce'
	| 'plans-paid-media'
	| 'plans-p2'
	| 'plans-default-wpcom'
	| 'plans-business-trial'
	| 'plans-videopress'
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
	isLaunchPage?: boolean | null;
	isReskinned?: boolean;
	onStorageAddOnClick?: ( addOnSlug: WPComStorageAddOnSlug ) => void;
	intervalType: string;
	currentSitePlanSlug?: string | null;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	planActionOverrides?: PlanActionOverrides;

	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	showRefundPeriod?: boolean;
	// only used for comparison grid
	planTypeSelectorProps?: PlanTypeSelectorProps;
	planUpgradeCreditsApplicable?: number | null;
	gridContainerRef?: React.MutableRefObject< HTMLDivElement | null >;
	gridSize?: string;
	canUserUpgradePlans: boolean;
}

export interface FeaturesGridProps extends CommonGridProps {
	gridPlans: GridPlan[];
	currentPlanManageHref?: string;
	generatedWPComSubdomain: DataResponse< { domain_name: string } >;
	gridPlanForSpotlight?: GridPlan;
	isCustomDomainAllowedOnFreePlan: boolean; // indicate when a custom domain is allowed to be used with the Free plan.
	paidDomainName?: string;
	showLegacyStorageFeature: boolean;
}

export interface ComparisonGridProps extends CommonGridProps {
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
}

export type UseActionCallbackParams = {
	planSlug: PlanSlug;
	cartItemForPlan?: MinimalRequestCartProduct | null;
	selectedStorageAddOn?: AddOns.AddOnMeta | null;
};

export type UseActionCallback = ( {
	planSlug,
	cartItemForPlan,
	selectedStorageAddOn,
}: UseActionCallbackParams ) => () => void;

export type GridContextProps = {
	gridPlans: GridPlan[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	siteId?: number | null;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	useActionCallback: UseActionCallback;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	canUserUpgradePlans?: boolean;
	children: React.ReactNode;
	coupon?: string;
	enableFeatureTooltips?: boolean;
	/**
	 * `enableCategorisedFeatures` relevant to Features Grid (and omitted from Comparison Grid)
	 * for rendering features with categories based on available/associated feature group map.
	 */
	enableCategorisedFeatures?: boolean;
	/**
	 * `featureGroupMap` is relevant for rendering features with categories.
	 * This is necessary for Comparison Grid and optional for Features Grid (i.e. applicable when `enableCategorisedFeatures` is set).
	 */
	featureGroupMap: Partial< FeatureGroupMap >;
	hideUnsupportedFeatures?: boolean;
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
	withDiscount?: string;
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
