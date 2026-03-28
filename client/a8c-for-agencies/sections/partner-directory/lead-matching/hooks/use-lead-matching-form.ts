import { useState } from 'react';
import { LeadMatchingDetails } from '../../types';
import { createDefaultLeadMatchingDetails } from '../../utils/map-application-form-data';

type Props = {
	initialFormData?: LeadMatchingDetails | null;
};

export default function useLeadMatchingForm( { initialFormData }: Props ) {
	const [ formData, setFormData ] = useState< LeadMatchingDetails >(
		initialFormData ?? createDefaultLeadMatchingDetails()
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
