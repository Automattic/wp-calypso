import { useState } from 'react';
import { LeadMatchingDetails } from '../../types';
import { getDefaultFormData, getFormDataWithTestOverrides } from './use-dev-test-overrides';

type Props = {
	initialFormData?: LeadMatchingDetails | null;
};

export default function useLeadMatchingForm( { initialFormData }: Props ) {
	const [ formData, setFormData ] = useState< LeadMatchingDetails >( () =>
		// DEV: Uses test overrides if URL params are present, otherwise uses initialFormData
		getFormDataWithTestOverrides( initialFormData )
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

export { getDefaultFormData };
