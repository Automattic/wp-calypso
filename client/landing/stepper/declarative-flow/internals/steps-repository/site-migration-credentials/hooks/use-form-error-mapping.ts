import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { FieldErrors } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import { ApiError, CredentialsFormData } from '../types';

// This function is used to map the error message to the correct field in the form.
// Backend is returning the errors related to backup files using 'from_url' key
// but we need to use 'backupFileLocation' to identify the field in the form.
const getFieldName = ( key: string, migrationType: string ) => {
	return 'backup' === migrationType && key === 'from_url' ? 'backupFileLocation' : key;
};

// ** This hook is used to map the error messages to the form fields errors.
export const useFormErrorMapping = (
	error?: ApiError | null,
	variables?: CredentialsFormData | null,
	siteInfo?: UrlData | undefined
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

	const getCredentialsErrorMessage = useCallback(
		( errorCode: number | undefined ) => {
			switch ( errorCode ) {
				case 404:
					return {
						from_url: {
							type: 'manual',
							message: translate( 'Check your site address.' ),
						},
					};
				default:
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
			}
		},
		[ translate ]
	);

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

	const handleSourceSiteInfoVerificationError = useCallback(
		( siteInfo: UrlData ) => {
			if ( siteInfo?.platform_data?.is_wpcom ) {
				return {
					from_url: {
						type: 'manual',
						message: translate( 'Your site is already on WordPress.com.' ),
					},
				};
			}
		},
		[ translate ]
	);
	const handleServerError = useCallback(
		( error: ApiError, { migrationType }: CredentialsFormData ) => {
			const { code, message, data } = error;

			if ( code === 'rest_missing_callback_param' || ! code ) {
				return {
					root: {
						type: 'manual',
						message: translate( 'An error occurred while saving credentials.' ),
					},
				};
			}

			if ( code === 'automated_migration_tools_login_and_get_cookies_test_failed' ) {
				return {
					root: {
						type: 'special',
						message: translate(
							'We could not verify your credentials. Can you double check your account information and try again?'
						),
					},
					...getCredentialsErrorMessage( data?.response_code ),
				};
			}

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
		},
		[ getTranslatedMessage, translate, getCredentialsErrorMessage ]
	);

	return useMemo( () => {
		const platformCheckError = siteInfo
			? handleSourceSiteInfoVerificationError( siteInfo )
			: undefined;
		const serverError = error && variables ? handleServerError( error, variables ) : undefined;

		if ( platformCheckError || serverError ) {
			return {
				...( serverError || {} ),
				...( platformCheckError || {} ),
			};
		}

		return undefined;
	}, [ error, handleServerError, variables, siteInfo, handleSourceSiteInfoVerificationError ] );
};
