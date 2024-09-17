import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
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

	const fieldMapping = {
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
	};

	const setGlobalError = ( message?: string | null | undefined ) => {
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		setError( 'root', {
			type: 'manual',
			message: message ?? translate( 'An error occurred while saving credentials.' ),
		} );
	};

	const handleMigrationError = ( err: MigrationError ) => {
		let hasUnmappedFieldError = false;

		if ( err.body?.code === 'rest_invalid_param' && err.body?.data?.params ) {
			Object.entries( err.body.data.params ).forEach( ( [ key ] ) => {
				const field = fieldMapping[ key as keyof typeof fieldMapping ];
				const keyName =
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					'backup' === accessMethod && field?.fieldName === 'siteAddress'
						? 'backupFileLocation'
						: field?.fieldName;

				if ( keyName ) {
					const message = field?.errorMessage ?? translate( 'Invalid input, please check again' );
					// eslint-disable-next-line @typescript-eslint/no-use-before-define
					setError( keyName as keyof CredentialsFormData, { type: 'manual', message } );
				} else if ( ! hasUnmappedFieldError ) {
					hasUnmappedFieldError = true;
					setGlobalError();
				}
			} );
		} else {
			setGlobalError( err.body?.message );
		}
	};

	const { isPending, requestAutomatedMigration } = useSiteMigrationCredentialsMutation( {
		onSuccess: () => {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit();
		},
		onError: ( error: any ) => {
			handleMigrationError( mapApiError( error ) );
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		},
	} );

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

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	const accessMethod = watch( 'howToAccessSite' );

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
