import { useExperiment } from 'calypso/lib/explat';
import { DataResponse } from 'calypso/my-sites/plans-grid/types';

export type YearlyPlanUpsellModalVariations = 'control' | 'dont_miss_out' | 'save_money';

const useYearlyPlanUpsellModalExperiment = (
	flowName?: string | null
): DataResponse< YearlyPlanUpsellModalVariations > => {
	const [ isLoading, experimentAssignment ] = useExperiment(
		'wpcom_gf_signup_paid_paid_monthly_to_annual_upgrade_modal',
		{
			isEligible: [ 'onboarding', 'onboarding-pm' ].includes( flowName ?? '' ),
		}
	);

	return {
		isLoading,
		// result: experimentAssignment?.variationName as YearlyPlanUpsellModalVariations,
		result: 'save_money',
	};
};
export default useYearlyPlanUpsellModalExperiment;
