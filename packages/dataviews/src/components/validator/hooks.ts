import { useCallback, useMemo, useState } from 'react';
import { Field, FormField, NormalizedField } from '../../types';
import { FormValidationState } from './types';
import { NormalizedFormField } from '../../normalize-form-fields';

export function useFieldValidation< Item >(
	field: NormalizedFormField,
	data: Item,
	fieldDefinition: NormalizedField< Item > | undefined,
	validation: FormValidationState,
	onChange: ( value: any ) => void
) {
	return useCallback(
		( value: any ) => {
			onChange( value );

			if ( ! validation.touchedFields?.includes( field.id ) ) {
				validation.setTouchedFields( [ field.id ] );
			}

			const errors = fieldDefinition?.rules.reduce(
				( acc, rule ) => {
					const error = rule.callback(
						value[ field.id ],
						fieldDefinition,
						data
					);

					return {
						...acc,
						...( error && { [ rule.type ]: error } ),
					};
				},
				{} as Record< string, string >
			);

			if ( errors && Object.keys( errors ).length > 0 ) {
				validation.setErrors( field.id, errors );
			} else {
				validation.removeError( field.id );
			}
		},
		[ field.id, fieldDefinition, validation, onChange ]
	);
}

export function useFieldError< Item >(
	field: NormalizedFormField,
	fieldDefinition: NormalizedField< Item > | undefined,
	validation: FormValidationState
) {
	return useMemo( () => {
		if ( validation.touchedFields.includes( field.id ) ) {
			const requiredError =
				validation?.errorMessages?.[ field.id ]?.[ 'required' ];

			if ( requiredError ) {
				return requiredError;
			}

			return Object.entries(
				validation?.errorMessages?.[ field.id ] ?? {}
			)
				.filter( ( [ key ] ) => key !== 'required' )
				.map( ( [ _, error ] ) => error )[ 0 ];
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
			touchedFields: [
				...prevValidationState.touchedFields,
				...touchedFields,
			],
		} ) );
	}, [] );

	const setErrors = useCallback(
		( field: string, error: Record< string, string | undefined > ) =>
			setValidationState( ( prevValidationState ) => ( {
				...prevValidationState,
				messageErrors: {
					...prevValidationState.messageErrors,
					[ field ]: error,
				},
			} ) ),
		[ validationState.messageErrors ]
	);

	const removeError = useCallback(
		( field: string ) =>
			setValidationState( ( prevValidationState ) => {
				const { [ field ]: _, ...rest } =
					prevValidationState.messageErrors;
				return {
					...prevValidationState,
					messageErrors: rest,
				};
			} ),
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
		removeError,
		isFormValid,
	};
};
