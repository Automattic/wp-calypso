import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { MigrationError, CredentialsFormData } from './types';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

const mapApiError = ( error: any ) => {
	return {
		body: {
			code: error.code,
			message: error.message,
			data: error.data,
		},
		status: error.status,
	};
};

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const translate = useTranslate();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';

	const {
		isPending,
		mutate: requestAutomatedMigration,
		error,
		isSuccess,
	} = useSiteMigrationCredentialsMutation();

	const {
		formState: { errors },
		control,
		handleSubmit,
		watch,
		setError,
		clearErrors,
	} = useForm< CredentialsFormData >( {
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		disabled: isPending,
		defaultValues: {
			siteAddress: importSiteQueryParam,
			username: '',
			password: '',
			backupFileLocation: '',
			notes: '',
			howToAccessSite: 'credentials',
		},
	} );
	const accessMethod = watch( 'howToAccessSite' );

	const fieldMapping: Record< string, { fieldName: string; errorMessage: string | null } > =
		useMemo(
			() => ( {
				from_url: {
					fieldName: 'siteAddress',
					errorMessage: translate( 'Enter a valid URL.' ),
				},
				username: {
					fieldName: 'username',
					errorMessage: translate( 'Enter a valid username.' ),
				},
				password: {
					fieldName: 'password',
					errorMessage: translate( 'Enter a valid password.' ),
				},
				migration_type: {
					fieldName: 'howToAccessSite',
					errorMessage: null,
				},
				notes: {
					fieldName: 'notes',
					errorMessage: null,
				},
			} ),
			[ translate ]
		);

	const setGlobalError = useCallback(
		( message?: string | null ) => {
			setError( 'root', {
				type: 'manual',
				message: message ?? translate( 'An error occurred while saving credentials.' ),
			} );
		},
		[ setError, translate ]
	);

	const handleMigrationError = useCallback(
		( err: MigrationError ) => {
			let hasUnmappedFieldError = false;

			if ( err.body?.code === 'rest_invalid_param' && err.body?.data?.params ) {
				Object.entries( err.body.data.params ).forEach( ( [ key ] ) => {
					const field = fieldMapping[ key as keyof typeof fieldMapping ];
					const keyName =
						'backup' === accessMethod && field?.fieldName === 'siteAddress'
							? 'backupFileLocation'
							: field?.fieldName;

					if ( keyName ) {
						const message = field?.errorMessage ?? translate( 'Invalid input, please check again' );
						setError( keyName as keyof CredentialsFormData, { type: 'manual', message } );
					} else if ( ! hasUnmappedFieldError ) {
						hasUnmappedFieldError = true;
						setGlobalError();
					}
				} );
			} else {
				setGlobalError( err.body?.message );
			}
		},
		[ accessMethod, fieldMapping, setError, setGlobalError, translate ]
	);

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit();
		}
	}, [ isSuccess, onSubmit ] );

	useEffect( () => {
		if ( error ) {
			handleMigrationError( mapApiError( error ) );
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		}
	}, [ error, handleMigrationError ] );

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	const submitHandler = ( data: CredentialsFormData ) => {
		requestAutomatedMigration( data );
	};

	return {
		formState: { errors },
		control,
		handleSubmit,
		errors,
		accessMethod,
		isPending,
		submitHandler,
		setError,
		importSiteQueryParam,
	};
};
