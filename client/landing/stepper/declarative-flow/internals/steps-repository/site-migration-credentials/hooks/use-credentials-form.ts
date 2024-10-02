/* eslint-disable @typescript-eslint/no-use-before-define */
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDebounce } from 'use-debounce';
import { useAnalyzeUrlQuery } from 'calypso/data/site-profiler/use-analyze-url-query';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isValidUrl } from 'calypso/lib/importer/url-validation';
import { CredentialsFormData } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ sourceUrl, setSourceUrl ] = useState( importSiteQueryParam );
	const [ debouncedSourceUrl ] = useDebounce( sourceUrl, 500 );

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
	} = useAnalyzeUrlQuery( debouncedSourceUrl, isEnglishLocale && isValidUrl( debouncedSourceUrl ) );

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

	const isWpcom = useMemo( () => !! siteInfo?.platform_data?.is_wpcom, [ siteInfo ] );

	const canBypassVerification = useMemo( () => {
		const credentialsVerificationFailed =
			error?.code === 'automated_migration_tools_login_and_get_cookies_test_failed';
		return credentialsVerificationFailed || isWpcom;
	}, [ error, isWpcom ] );

	const submitHandler = useCallback(
		( data: CredentialsFormData ) => {
			clearErrors();
			requestAutomatedMigration( {
				...data,
				bypassVerification: canBypassVerification || ! isEnglishLocale,
			} );
		},
		[ requestAutomatedMigration, canBypassVerification, isEnglishLocale, clearErrors ]
	);

	const getContinueButtonText = useCallback( () => {
		if ( isEnglishLocale && ( isPending || isSiteInfoLoading ) && ! canBypassVerification ) {
			return translate( 'Verifying credentials' );
		}
		if ( isEnglishLocale && canBypassVerification ) {
			return translate( 'Continue anyways' );
		}
		return translate( 'Continue' );
	}, [ isPending, canBypassVerification, isEnglishLocale, translate, isSiteInfoLoading ] );

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit();
		} else if ( error ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		}
	}, [ isSuccess, error, onSubmit, clearErrors ] );

	useEffect( () => {
		const { unsubscribe } = watch( ( formData, changedField ) => {
			if ( changedField?.name === 'from_url' && formData?.from_url ) {
				setSourceUrl( formData?.from_url );
				clearErrors( 'from_url' );
			}

			clearErrors( 'root' );
			reset();
		} );
		return () => unsubscribe();
	}, [ watch, clearErrors, reset ] );

	return {
		formState: { errors },
		errors,
		control,
		handleSubmit,
		submitHandler,
		accessMethod: watch( 'migrationType' ),
		isPending,
		getContinueButtonText,
		isSiteInfoLoading,
		isPlatformVerificationError,
		isWpcom,
	};
};
