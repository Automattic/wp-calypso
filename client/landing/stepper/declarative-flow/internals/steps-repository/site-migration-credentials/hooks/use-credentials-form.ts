import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsFormData } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ requestInAnywayMode, setRequestInAnywayMode ] = useState( false );
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

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
		if ( ! error ) {
			return;
		}

		recordTracksEvent( 'calypso_site_migration_automated_request_error' );

		const { code } = error;

		const anywayModeErrors = [ 'automated_migration_tools_login_and_get_cookies_test_failed' ];

		if ( anywayModeErrors.includes( code ) ) {
			setRequestInAnywayMode( true );
		}
	}, [ error ] );

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
			setRequestInAnywayMode( false );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	const submitHandler = ( data: CredentialsFormData ) => {
		requestAutomatedMigration( {
			...data,
			bypassVerification: requestInAnywayMode || ! isEnglishLocale,
		} );
	};

	const getContinueButtonText = useCallback( () => {
		if ( isEnglishLocale && isPending && ! requestInAnywayMode ) {
			return translate( 'Verifying credentials' );
		}

		if ( isEnglishLocale && requestInAnywayMode ) {
			return translate( 'Continue anyways' );
		}

		return translate( 'Continue' );
	}, [ isPending, requestInAnywayMode, isEnglishLocale, translate ] );

	return {
		formState: { errors },
		control,
		handleSubmit,
		errors,
		accessMethod,
		isPending,
		submitHandler,
		importSiteQueryParam,
		getContinueButtonText,
	};
};
