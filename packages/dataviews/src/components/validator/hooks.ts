import { useCallback, useMemo, useState } from 'react';
import { FormField, NormalizedField } from '../../types';
import { FormValidationState } from './types';

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

			const errors = fieldDefinition?.rules.reduce( ( acc, rule ) => {
				const error = rule.callback( value[ field.id ] );
				return { ...acc, [ rule.type ]: error };
			}, {} );

			validation.setErrors( field.id, errors ?? {} );
		},
		[ field.id, fieldDefinition, validation, onChange ]
	);
}

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

export const useValidation = (): FormValidationState => {
	const [ validationState, setValidationState ] = useState( {
		touchedFields: [] as string[],
		messageErrors: {} as Record<
			string,
			Record< string, string | undefined >
		>,
	} );

	const setTouchedFields = useCallback( ( touchedFields: string[] ) => {
		setValidationState( ( prevValidationState ) => ( {
			...prevValidationState,
			touchedFields,
		} ) );
	}, [] );

	const setErrors = useCallback(
		( field: string, error: Record< string, string | undefined > ) =>
			setValidationState( ( prevValidationState ) => ( {
				...prevValidationState,
				messageErrors: {
					...validationState.messageErrors,
					[ field ]: error,
				},
			} ) ),
		[ validationState.messageErrors ]
	);

	const isFormValid = useCallback(
		() =>
			Object.values( validationState.messageErrors ).every(
				( fieldErrors ) =>
					Object.values( fieldErrors ).every(
						( errorMessage ) => ! errorMessage
					)
			),
		[ validationState.messageErrors ]
	);

	return {
		touchedFields: validationState.touchedFields,
		errorMessages: validationState.messageErrors,
		setTouchedFields,
		setErrors,
		isFormValid,
	};
};
