import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFormErrorMapping } from './hooks/use-form-error-mapping';
import { CredentialsFormData } from './types';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const {
		isPending,
		mutate: requestAutomatedMigration,
		error,
		isSuccess,
		variables,
	} = useSiteMigrationCredentialsMutation();

	const serverSideError = useFormErrorMapping( error, variables );

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
			from_url: importSiteQueryParam,
			username: '',
			password: '',
			backupFileLocation: '',
			notes: '',
			migrationType: 'credentials',
		},
		errors: serverSideError,
	} );

	const accessMethod = watch( 'migrationType' );

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit();
		}
	}, [ isSuccess, onSubmit ] );

	useEffect( () => {
		if ( error ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		}
	}, [ error ] );

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
