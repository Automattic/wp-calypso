import { useMemo } from 'react';
import { FormField } from '../types';
import { FormValidationState } from './use-form';

export function useFieldError< Item >(
	field: FormField,
	fieldDefinition: any,
	validation: FormValidationState
) {
	return useMemo( () => {
		if (
			( fieldDefinition?.validationSchema?.onTouched &&
				validation.touchedFields.includes( fieldDefinition.id ) ) ||
			! fieldDefinition?.validationSchema?.onTouched
		) {
			return Object.values(
				validation.errorMessages[ field.id ] ?? []
			)[ 0 ];
		}
		return '';
	}, [ field.id, fieldDefinition, validation ] );
}
