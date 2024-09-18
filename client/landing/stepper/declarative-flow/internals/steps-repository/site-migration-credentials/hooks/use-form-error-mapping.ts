import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';
import { ApiError, CredentialsFormData } from '../types';

// ** This hook is used to map the error messages to the form fields errors.
export const useFormErrorMapping = (
	error?: ApiError | null,
	variables?: CredentialsFormData | null
): FieldErrors< CredentialsFormData > | undefined => {
	const translate = useTranslate();

	const fieldMapping: Record< string, { type: string; message: string } | null > = useMemo(
		() => ( {
			from_url: { type: 'manual', message: translate( 'Enter a valid URL.' ) },
			username: { type: 'manual', message: translate( 'Enter a valid username.' ) },
			password: { type: 'manual', message: translate( 'Enter a valid password.' ) },
			backupFileLocation: { type: 'manual', message: translate( 'Enter a valid URL.' ) },
		} ),
		[ translate ]
	);

	const getTranslatedMessage = ( key: string ) => {
		return (
			fieldMapping[ key ] ?? {
				type: 'manual',
				message: translate( 'Invalid input, please check again' ),
			}
		);
	};

	// This function is used to map the error message to the correct field in the form.
	// Backend is returning the errors related to backup files using 'from_url' key
	// but we need to use 'backupFileLocation' to identify the field in the form.
	const getFieldName = ( key: string, migrationType: string ) => {
		return 'backup' === migrationType && key === 'from_url' ? 'backupFileLocation' : key;
	};

	const handleServerError = ( error: ApiError, { migrationType }: CredentialsFormData ) => {
		const { code, message, data } = error;
		if ( code !== 'rest_invalid_param' || ! data?.params ) {
			return { root: { type: 'manual', message } };
		}
		const invalidFields = Object.keys( data.params );

		return invalidFields.reduce(
			( errors, key ) => {
				const fieldName = getFieldName( key, migrationType );
				const message = getTranslatedMessage( key );

				errors[ fieldName ] = message;
				return errors;
			},
			{} as Record< string, { type: string; message: string } >
		);
	};

	if ( error && variables ) {
		return handleServerError( error, variables ) as FieldErrors< CredentialsFormData >;
	}

	return undefined;
};
