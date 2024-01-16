import { UrlFriendlyTermType, type PlanSlug } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { type TranslateResult } from 'i18n-calypso';

export type PlanTypeSelectorProps = {
	kind: 'interval';
	selectedSiteId?: number | null;
	basePlansPath?: string | null;
	intervalType: UrlFriendlyTermType;
	customerType: string;
	withDiscount?: string;
	enableStickyBehavior?: boolean;
	stickyPlanTypeSelectorOffset?: number;
	onPlanIntervalChange: ( selectedItem: { key: SupportedUrlFriendlyTermType } ) => void;
	layoutClassName?: string;
	siteSlug?: string | null;
	selectedPlan?: string;
	selectedFeature?: string;
	showPlanTypeSelectorDropdown?: boolean; // feature flag used for the plan selector dropdown
	isInSignup: boolean;
	plans: PlanSlug[];
	eligibleForWpcomMonthlyPlans?: boolean;
	isPlansInsideStepper: boolean;
	hideDiscountLabel?: boolean;
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
};
export type IntervalTypeProps = Pick<
	PlanTypeSelectorProps,
	| 'intervalType'
	| 'selectedSiteId'
	| 'displayedIntervals'
	| 'plans'
	| 'isInSignup'
	| 'eligibleForWpcomMonthlyPlans'
	| 'isPlansInsideStepper'
	| 'hideDiscountLabel'
	| 'redirectTo'
	| 'showPlanTypeSelectorDropdown'
	| 'selectedPlan'
	| 'selectedFeature'
	| 'currentSitePlanSlug'
	| 'useCheckPlanAvailabilityForPurchase'
	| 'title'
	| 'coupon'
	| 'onPlanIntervalChange'
>;

export type SupportedUrlFriendlyTermType = Extract<
	UrlFriendlyTermType,
	'yearly' | '2yearly' | '3yearly' | 'monthly'
>;
