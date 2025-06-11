/**
 * WordPress dependencies
 */
import { useCallback, useState } from '@wordpress/element';

export type FormValidationState = {
	touchedFields: string[];
	errorMessages: Record< string, Record< string, string | undefined > >;
	setTouchedFields: ( touchedFields: string[] ) => void;
	setErrors: (
		field: string,
		error: Record< string, string | undefined >
	) => void;
	isFormValid: () => boolean;
};

/**
 * Internal dependencies
 */
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
