import { PlanSlug } from '@automattic/calypso-products';
import { UsePricingMetaForGridPlans } from '../../hooks/npm-ready/data-store/use-grid-plans';

export type PlanTypeSelectorProps = {
	kind: 'interval' | 'customer';
	basePlansPath?: string | null;
	intervalType: string;
	customerType: string;
	withDiscount?: string;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	showBiennialToggle?: boolean;
	isInSignup: boolean;
	plans: PlanSlug[];
	eligibleForWpcomMonthlyPlans?: boolean;
	isPlansInsideStepper: boolean;
	hideDiscountLabel?: boolean;
	redirectTo?: string | null;
	isStepperUpgradeFlow: boolean;
	currentSitePlanSlug?: PlanSlug | null;
	usePricingMetaForGridPlans: UsePricingMetaForGridPlans;
	recordTracksEvent?: ( eventName: string, eventProperties: Record< string, unknown > ) => void;
};
export type IntervalTypeProps = Pick<
	PlanTypeSelectorProps,
	| 'intervalType'
	| 'plans'
	| 'isInSignup'
	| 'eligibleForWpcomMonthlyPlans'
	| 'isPlansInsideStepper'
	| 'hideDiscountLabel'
	| 'redirectTo'
	| 'showBiennialToggle'
	| 'selectedPlan'
	| 'selectedFeature'
	| 'currentSitePlanSlug'
	| 'usePricingMetaForGridPlans'
>;
