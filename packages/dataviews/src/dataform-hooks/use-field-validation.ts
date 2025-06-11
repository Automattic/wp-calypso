import { useCallback, useMemo } from '@wordpress/element';
import { FormField, NormalizedField } from '../types';
import { FormValidationState } from './use-form';

export function useFieldValidation< Item >(
	field: FormField,
	fieldDefinition: NormalizedField< Item > | undefined,
	validation: FormValidationState,
	onChange: ( value: any ) => void
) {
	return useCallback(
		( value: any ) => {
			onChange( value );

			if ( ! validation.touchedFields?.includes( field.id ) ) {
				validation.setTouchedFields( [
					...validation.touchedFields,
					field.id,
				] );
			}

			const errors = Object.entries(
				fieldDefinition?.validationCallbacks ?? {}
			).reduce( ( acc, [ key, callback ] ) => {
				const error = callback( value[ field.id ] );
				if ( ! error ) return acc;
				return { ...acc, [ key ]: error };
			}, {} );

			validation.setErrors( field.id, errors );
		},
		[ field.id, fieldDefinition, validation, onChange ]
	);
}
