import { FeatureList } from '@automattic/calypso-products';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { ForwardedRef } from 'react';
import { FeatureObject } from 'calypso/lib/plans/features-list';
import { PlanTypeSelectorProps } from '../plans-features-main/components/plan-type-selector';
import {
	GridPlan,
	PlansIntent,
	UsePricingMetaForGridPlans,
} from './hooks/npm-ready/data-store/use-grid-plans';
import type { DomainSuggestion } from '@automattic/data-stores';
import type { LocalizeProps, TranslateResult } from 'i18n-calypso';

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

export interface PlanFeatures2023GridProps {
	gridPlansForFeaturesGrid: GridPlan[];
	gridPlansForComparisonGrid: GridPlan[];
	gridPlanForSpotlight?: GridPlan;
	// allFeaturesList temporary until feature definitions are ported to calypso-products package
	allFeaturesList: FeatureList;
	isInSignup?: boolean;
	siteId?: number | null;
	isLaunchPage?: boolean | null;
	isReskinned?: boolean;
	onUpgradeClick?: ( cartItem?: MinimalRequestCartProduct | null ) => void;
	flowName?: string | null;
	paidDomainName?: string;
	wpcomFreeDomainSuggestion: DataResponse< DomainSuggestion >; // used to show a wpcom free domain in the Free plan column when a paid domain is picked.
	intervalType?: string;
	currentSitePlanSlug?: string | null;
	hidePlansFeatureComparison?: boolean;
	hideUnavailableFeatures?: boolean; // used to hide features that are not available, instead of strike-through as explained in #76206
	planActionOverrides?: PlanActionOverrides;
	// Value of the `?plan=` query param, so we can highlight a given plan.
	selectedPlan?: string;
	// Value of the `?feature=` query param, so we can highlight a given feature and hide plans without it.
	selectedFeature?: string;
	intent?: PlansIntent;
	isCustomDomainAllowedOnFreePlan: DataResponse< boolean >; // indicate when a custom domain is allowed to be used with the Free plan.
	isGlobalStylesOnPersonal?: boolean;
	showLegacyStorageFeature?: boolean;
	showUpgradeableStorage: boolean; // feature flag used to show the storage add-on dropdown
	stickyRowOffset: number;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	showOdie?: () => void;
	// temporary
	showPlansComparisonGrid: boolean;
	// temporary
	toggleShowPlansComparisonGrid: () => void;
	planTypeSelectorProps: PlanTypeSelectorProps;
}

export interface PlanFeatures2023GridType extends PlanFeatures2023GridProps {
	isLargeCurrency: boolean;
	translate: LocalizeProps[ 'translate' ];
	canUserPurchasePlan: boolean | null;
	manageHref: string;
	selectedSiteSlug: string | null;
	isPlanUpgradeCreditEligible: boolean;
	// temporary: element ref to scroll comparison grid into view once "Compare plans" button is clicked
	plansComparisonGridRef: ForwardedRef< HTMLDivElement >;
}

export type PlanRowOptions = {
	isTableCell?: boolean;
	isStuck?: boolean;
};
