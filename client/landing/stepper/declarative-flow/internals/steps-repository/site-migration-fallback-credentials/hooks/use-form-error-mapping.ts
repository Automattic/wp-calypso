import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';
import { ApiError, CredentialsFormData } from '../../site-migration-credentials/types';

// ** This hook is used to map the error messages to the form fields errors.
export const useFormErrorMapping = (
	error?: ApiError | null,
	variables?: CredentialsFormData | null
): FieldErrors< CredentialsFormData > | undefined => {
	const translate = useTranslate();

	const fieldMapping: Record< string, { type: string; message: string } | null > = useMemo(
		() => ( {
			username: { type: 'manual', message: translate( 'Enter a valid username.' ) },
			password: { type: 'manual', message: translate( 'Enter a valid password.' ) },
		} ),
		[ translate ]
	);

	const credentialsErrorMessage = useMemo( () => {
		return {
			username: {
				type: 'manual',
				message: translate( 'Check your username.' ),
			},
			password: {
				type: 'manual',
				message: translate( 'Check your password.' ),
			},
		};
	}, [ translate ] );

	const getTranslatedMessage = useCallback(
		( key: string ) => {
			return (
				fieldMapping[ key ] ?? {
					type: 'manual',
					message: translate( 'Invalid input, please check again' ),
				}
			);
		},
		[ fieldMapping, translate ]
	);

	const handleServerError = useCallback(
		( error: ApiError ) => {
			const { code, message, data } = error;

			if ( 'rest_missing_callback_param' === code || ! code ) {
				return {
					root: {
						type: 'manual',
						message: translate( 'An error occurred while saving credentials.' ),
					},
				};
			}

			if ( 'automated_migration_tools_login_and_get_cookies_test_failed' === code ) {
				return {
					root: {
						type: 'special',
						message: translate(
							'We could not verify your credentials. Can you double check your account information and try again?'
						),
					},
					...credentialsErrorMessage,
				};
			}

			if ( 'rest_invalid_param' !== code || ! data?.params ) {
				return { root: { type: 'manual', message } };
			}

			const invalidFields = Object.keys( data.params );

			return invalidFields.reduce(
				( errors, key ) => {
					const message = getTranslatedMessage( key );

					errors[ key ] = message;
					return errors;
				},
				{} as Record< string, { type: string; message: string } >
			);
		},
		[ getTranslatedMessage, translate, credentialsErrorMessage ]
	);

	return useMemo( () => {
		const serverError = error && variables ? handleServerError( error ) : undefined;

		if ( serverError ) {
			return {
				...( serverError || {} ),
			};
		}

		return undefined;
	}, [ error, handleServerError, variables ] );
};
