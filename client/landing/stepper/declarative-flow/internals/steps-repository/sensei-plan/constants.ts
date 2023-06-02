import { useI18n } from '@wordpress/react-i18n';
import type { Props as PlanItemProps } from 'calypso/../packages/plans-grid/src/plans-table/plan-item';

export enum Status {
	Initial,
	Bundling,
	Error,
}

export function useFeatures(): PlanItemProps[ 'features' ] {
	const { __ } = useI18n();

	return [
		{
			name: __( 'Priority live chat support' ),
			requiresAnnuallyBilledPlan: true,
		},
		{
			name: __( 'Unlimited courses and students' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Interactive videos and lessons' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Quizzes and certificates' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Sell courses and subscriptions' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( '200GB file and video storage' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Best-in-class hosting' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Advanced Jetpack features' ),
			requiresAnnuallyBilledPlan: false,
		},
	];
}
