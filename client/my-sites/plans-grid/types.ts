import { Plans } from '@automattic/data-stores';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import { type PlanTypeSelectorProps } from './components/plan-type-selector';
import type { GridPlan, PlansIntent } from './hooks/npm-ready/data-store/use-grid-plans';
import type { FeatureList, PlanSlug, WPComStorageAddOnSlug } from '@automattic/calypso-products';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { LocalizeProps, TranslateResult } from 'i18n-calypso';

export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
	isHighlighted?: boolean;
};

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		text?: TranslateResult;
		status?: 'blocked' | 'enabled';
		callback?: () => void;
	};
	currentPlan?: {
		text?: TranslateResult;
		callback?: () => void;
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
	selectedSiteId?: number | null;
	isInSignup: boolean;
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
	onUpgradeClick: ( planSlug: PlanSlug ) => void;
}

export interface FeaturesGridProps extends CommonGridProps {
	gridPlans: GridPlan[];
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	currentPlanManageHref?: string;
	isPlanUpgradeCreditEligible: boolean;
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

export type GridContextProps = {
	gridPlans: GridPlan[];
	allFeaturesList: FeatureList;
	intent?: PlansIntent;
	selectedSiteId?: number | null;
	useCheckPlanAvailabilityForPurchase: Plans.UseCheckPlanAvailabilityForPurchase;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
	children: React.ReactNode;
	coupon?: string;
};

export type ComparisonGridExternalProps = Omit< GridContextProps, 'children' > &
	Omit< ComparisonGridProps, 'onUpgradeClick' > & {
		onUpgradeClick?: (
			cartItems?: MinimalRequestCartProduct[] | null,
			clickedPlanSlug?: PlanSlug
		) => void;
	};

export type FeaturesGridExternalProps = Omit< GridContextProps, 'children' > &
	Omit<
		FeaturesGridProps,
		'onUpgradeClick' | 'isLargeCurrency' | 'translate' | 'isPlanUpgradeCreditEligible'
	> & {
		onUpgradeClick?: (
			cartItems?: MinimalRequestCartProduct[] | null,
			clickedPlanSlug?: PlanSlug
		) => void;
	};
