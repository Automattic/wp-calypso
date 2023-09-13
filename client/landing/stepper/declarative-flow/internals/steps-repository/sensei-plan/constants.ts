import { useI18n } from '@wordpress/react-i18n';
import i18n, { getLocaleSlug } from 'i18n-calypso';
import type { Props as PlanItemProps } from 'calypso/../packages/plans-grid/src/plans-table/plan-item';

export enum Status {
	Initial,
	Bundling,
	Error,
}

const useSenseiPlanStorageText = () => {
	const { __ } = useI18n();
	// If we have the new CTA translated or the locale is EN, return the new string, otherwise use the simpler already translated one.
	return i18n.hasTranslation( '50GB file and video storage' ) ||
		[ 'en', 'en-gb' ].includes( getLocaleSlug() || '' )
		? __( '50 GB file and video storage' )
		: __( '50 GB Storage' );
};

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
			name: useSenseiPlanStorageText(),
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
