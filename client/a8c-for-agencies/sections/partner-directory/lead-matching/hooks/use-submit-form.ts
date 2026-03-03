import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { setActiveAgency } from 'calypso/state/a8c-for-agencies/agency/actions';
import { getActiveAgency } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { Agency } from 'calypso/state/a8c-for-agencies/types';
import { LeadMatchingDetails } from '../../types';

type Props = {
	formData: LeadMatchingDetails | null;
	onSubmitSuccess?: ( data: Agency ) => void;
	onSubmitError?: () => void;
};

export default function useSubmitForm( { formData, onSubmitSuccess, onSubmitError }: Props ) {
	const dispatch = useDispatch();
	const agency = useSelector( getActiveAgency );
	const [ isSubmitting, setIsSubmitting ] = useState( false );

	const onSubmit = useCallback( async () => {
		if ( ! formData || ! agency ) {
			onSubmitError?.();
			return;
		}

		setIsSubmitting( true );

		try {
			// TODO: Replace with actual API call when endpoint is available
			// For now, we'll simulate a successful save by updating the local state
			// The actual implementation would use a mutation hook similar to:
			// useSubmitPartnerDirectoryApplicationMutation

			// Simulate API delay
			await new Promise( ( resolve ) => setTimeout( resolve, 500 ) );

			// Create updated agency with lead matching data
			const updatedAgency: Agency = {
				...agency,
				profile: {
					...agency.profile,
					lead_matching_details: {
						regions: formData.regions,
						supports_global: formData.supportsGlobal,
						languages: formData.languages,
						business_types: formData.businessTypes,
						other_business_type: formData.otherBusinessType,
						ideal_business_types: formData.idealBusinessTypes,
						other_ideal_business_type: formData.otherIdealBusinessType,
						company_sizes: formData.companySizes,
						hosting_environments: formData.hostingEnvironments,
						supports_hosting_recommendation: formData.supportsHostingRecommendation,
						migration_platforms: formData.migrationPlatforms,
						store_complexities: formData.storeComplexities,
						project_types: formData.projectTypes,
						supports_quick_help: formData.supportsQuickHelp,
						service_levels: formData.serviceLevels,
						budget_levels: formData.budgetLevels,
						minimum_budget: formData.minimumBudget,
						timing_preferences: formData.timingPreferences,
						supports_hard_deadlines: formData.supportsHardDeadlines,
						decision_processes: formData.decisionProcesses,
						ongoing_relationships: formData.ongoingRelationships,
						requires_maintenance: formData.requiresMaintenance,
					},
				},
			};

			dispatch( setActiveAgency( updatedAgency ) );
			onSubmitSuccess?.( updatedAgency );
		} catch {
			onSubmitError?.();
		} finally {
			setIsSubmitting( false );
		}
	}, [ formData, agency, dispatch, onSubmitSuccess, onSubmitError ] );

	return {
		onSubmit,
		isSubmitting,
	};
}
