import { useState } from 'react';
import { LeadMatchingDetails } from '../../types';

const getDefaultFormData = (): LeadMatchingDetails => ( {
	regions: [],
	supportsGlobal: false,
	languages: [],
	businessTypes: [],
	otherBusinessType: '',
	idealBusinessTypes: [],
	otherIdealBusinessType: '',
	companySizes: [],
	hostingEnvironments: [],
	supportsHostingRecommendation: false,
	migrationPlatforms: [],
	storeComplexities: [],
	projectTypes: [],
	supportsQuickHelp: false,
	serviceLevels: [],
	budgetLevels: [],
	minimumBudget: '',
	timingPreferences: [],
	supportsHardDeadlines: false,
	decisionProcesses: [],
	ongoingRelationships: [],
	requiresMaintenance: false,
} );

type Props = {
	initialFormData?: LeadMatchingDetails | null;
};

export default function useLeadMatchingForm( { initialFormData }: Props ) {
	const [ formData, setFormData ] = useState< LeadMatchingDetails >(
		initialFormData ?? getDefaultFormData()
	);

	const updateField = < K extends keyof LeadMatchingDetails >(
		field: K,
		value: LeadMatchingDetails[ K ]
	) => {
		setFormData( ( state ) => ( {
			...state,
			[ field ]: value,
		} ) );
	};

	return {
		formData,
		setFormData,
		updateField,
	};
}
