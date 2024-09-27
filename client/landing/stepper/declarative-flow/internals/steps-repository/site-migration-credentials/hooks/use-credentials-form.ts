import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsFormData } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ canBypassVerification, setCanBypassVerification ] = useState( false );
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const [ formData, setFormData ] = useState< CredentialsFormData | null >( null );

	const {
		isPending,
		mutate: requestAutomatedMigration,
		error,
		isSuccess,
		variables,
		reset,
	} = useSiteMigrationCredentialsMutation();

	const {
		data: siteInfo,
		isError: isPlatformVerificationError,
		isLoading: isSiteInfoLoading,
	} = useAnalyzeUrlQuery( formData?.from_url ?? '', !! formData && ! canBypassVerification );

	const serverSideError = useFormErrorMapping( error, variables, siteInfo );

	const {
		formState: { errors },
		control,
		handleSubmit,
		watch,
		clearErrors,
	} = useForm< CredentialsFormData >( {
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		disabled: isPending || isSiteInfoLoading,
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
		if ( ! formData || isSiteInfoLoading || ( ! siteInfo && ! isPlatformVerificationError ) ) {
			return;
		}

		if ( ! canBypassVerification && siteInfo?.platform_data?.is_wpcom ) {
			setFormData( null );
			setCanBypassVerification( true );
			return;
		}

		requestAutomatedMigration( {
			...formData,
			bypassVerification: canBypassVerification || ! isEnglishLocale,
		} );
	}, [
		siteInfo,
		formData,
		canBypassVerification,
		isPlatformVerificationError,
		isSiteInfoLoading,
		isEnglishLocale,
		requestAutomatedMigration,
	] );

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

		setFormData( null );

		recordTracksEvent( 'calypso_site_migration_automated_request_error' );

		const { code } = error;

		const anywayModeErrors = [ 'automated_migration_tools_login_and_get_cookies_test_failed' ];

		if ( anywayModeErrors.includes( code ) ) {
			setCanBypassVerification( true );
		}
	}, [ error ] );

	useEffect( () => {
		const { unsubscribe } = watch( () => {
			clearErrors( 'root' );
			setCanBypassVerification( false );
			setFormData( null );
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors ] );

	const submitHandler = ( data: CredentialsFormData ) => {
		reset();
		clearErrors();
		setFormData( data );
	};

	const getContinueButtonText = useCallback( () => {
		if ( isEnglishLocale && ( isPending || isSiteInfoLoading ) && ! canBypassVerification ) {
			return translate( 'Verifying credentials' );
		}

		if ( isEnglishLocale && canBypassVerification ) {
			return translate( 'Continue anyways' );
		}

		return translate( 'Continue' );
	}, [ isPending, canBypassVerification, isEnglishLocale, translate, isSiteInfoLoading ] );

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
		siteInfo,
		isPlatformVerificationError,
		isSiteInfoLoading,
	};
};
