import type { PlansIntent } from './grid-context';
import type {
	GridPlan,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { FeatureObject, FeatureList } from '@automattic/calypso-products';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PlanTypeSelectorProps } from 'calypso/my-sites/plans-features-main/components/plan-type-selector';
import type { TranslateResult } from 'i18n-calypso';

export type TransformedFeatureObject = FeatureObject & {
	availableForCurrentPlan: boolean;
	availableOnlyForAnnualPlans: boolean;
};

export interface PlanActionOverrides {
	loggedInFreePlan?: {
		callback: () => void;
		text: TranslateResult;
	};
}

// A generic type representing the response of an async request.
// It's probably generic enough to be put outside of the pricing grid package,
// but at the moment it's located here to reduce its scope of influence.
export type DataResponse< T > = {
	isLoading: boolean;
	result?: T;
};

/** The various Grid (Features/Comparison) props below */
interface ContextProps {
	intent?: PlansIntent;
	gridPlans: GridPlan[];
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
}

interface SharedPlansGridProps extends ContextProps {
	intervalType?: string;
	isInSignup?: boolean;
	isLaunchPage?: boolean | null;
	flowName?: string | null;
	currentSitePlanSlug?: string | null;
	onUpgradeClick?: ( cartItem?: MinimalRequestCartProduct | null ) => void;
	siteId?: number | null;
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	isGlobalStylesOnPersonal?: boolean;
	showLegacyStorageFeature?: boolean;
}

export interface PlanComparisonGridProps extends SharedPlansGridProps {
	planTypeSelectorProps: PlanTypeSelectorProps;
}

export interface PlanFeaturesGridProps extends SharedPlansGridProps {
	gridPlanForSpotlight?: GridPlan;
	isReskinned?: boolean;
	paidDomainName?: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	showOdie?: () => void;
}
