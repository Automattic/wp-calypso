import {
	FEATURE_SENSEI_SUPPORT,
	FEATURE_SENSEI_UNLIMITED,
	FEATURE_SENSEI_INTERACTIVE,
	FEATURE_SENSEI_QUIZZES,
	FEATURE_SENSEI_SELL_COURSES,
	FEATURE_SENSEI_STORAGE,
	FEATURE_SENSEI_HOSTING,
	FEATURE_SENSEI_JETPACK,
	getFeatureByKey,
} from '@automattic/calypso-products';
import type { Props as PlanItemProps } from 'calypso/../packages/plans-grid/src/plans-table/plan-item';

export enum Status {
	Initial,
	Bundling,
	Error,
}

export function useFeatures(): PlanItemProps[ 'features' ] {
	return [
		{
			name: getFeatureByKey( FEATURE_SENSEI_SUPPORT ).getTitle() as string,
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_UNLIMITED ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_INTERACTIVE ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_QUIZZES ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_SELL_COURSES ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_STORAGE ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_HOSTING ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: getFeatureByKey( FEATURE_SENSEI_JETPACK ).getTitle() as string,
			requiresAnnuallyBilledPlan: false,
		},
	];
}
