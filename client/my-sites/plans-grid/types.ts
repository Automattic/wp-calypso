import { FeatureObject } from 'calypso/lib/plans/features-list';
import type { TranslateResult } from 'i18n-calypso';

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
