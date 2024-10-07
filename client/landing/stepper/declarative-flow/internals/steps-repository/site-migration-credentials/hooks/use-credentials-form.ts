/* eslint-disable @typescript-eslint/no-use-before-define */
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { CredentialsFormData } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useSiteMigrationCredentialsMutation } from './use-site-migration-credentials-mutation';

export const useCredentialsForm = ( onSubmit: () => void ) => {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ siteInfo, setSiteInfo ] = useState< UrlData | undefined >( undefined );
	const [ isBusy, setIsBusy ] = useState( false );

	const analyzeUrl = useCallback( async ( domain: string ): Promise< UrlData | undefined > => {
		try {
			return await wp.req.get( {
				path: '/imports/analyze-url?site_url=' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} );
		} catch ( error ) {
			return undefined;
		}
	}, [] );

	const {
		mutateAsync: requestAutomatedMigration,
		error,
		isSuccess,
		variables,
		reset,
	} = useSiteMigrationCredentialsMutation();

	const serverSideError = useFormErrorMapping( error, variables, siteInfo );

	const {
		formState: { errors, isSubmitting },
		control,
		handleSubmit,
		watch,
		clearErrors,
	} = useForm< CredentialsFormData >( {
		mode: 'onSubmit',
		reValidateMode: 'onSubmit',
		disabled: isBusy,
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

	useEffect( () => {
		setIsBusy( isSubmitting );
	}, [ isSubmitting ] );

	const isWpcom = useMemo( () => !! siteInfo?.platform_data?.is_wpcom, [ siteInfo ] );

	const canBypassVerification = useMemo( () => {
		const credentialsVerificationFailed =
			error?.code === 'automated_migration_tools_login_and_get_cookies_test_failed';
		return credentialsVerificationFailed || isWpcom;
	}, [ error, isWpcom ] );

	const submitHandler = useCallback(
		async ( data: CredentialsFormData ) => {
			clearErrors();

			const payload = {
				...data,
				bypassVerification: canBypassVerification || ! isEnglishLocale,
			};

			const siteInfoResult = canBypassVerification ? siteInfo : await analyzeUrl( data.from_url );
			setSiteInfo( siteInfoResult );

			if ( siteInfoResult?.platform_data?.is_wpcom && ! canBypassVerification ) {
				return;
			}

			try {
				await requestAutomatedMigration( payload );
			} catch ( error ) {
				// Do nothing, error is handled by the form.
			}
		},
		[
			requestAutomatedMigration,
			canBypassVerification,
			isEnglishLocale,
			clearErrors,
			analyzeUrl,
			siteInfo,
		]
	);

	const getContinueButtonText = useCallback( () => {
		if ( isEnglishLocale && isSubmitting && ! canBypassVerification ) {
			return translate( 'Verifying credentials' );
		}
		if ( isEnglishLocale && canBypassVerification ) {
			return translate( 'Continue anyways' );
		}
		return translate( 'Continue' );
	}, [ isSubmitting, canBypassVerification, isEnglishLocale, translate ] );

	useEffect( () => {
		if ( isSuccess ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_success' );
			onSubmit( siteInfo );
		} else if ( error ) {
			recordTracksEvent( 'calypso_site_migration_automated_request_error' );
		}
	}, [ isSuccess, error, onSubmit, siteInfo ] );

	useEffect( () => {
		const { unsubscribe } = watch( ( formData, changedField ) => {
			if ( changedField?.name === 'from_url' && formData?.from_url ) {
				setSiteInfo( undefined );
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
		isBusy,
		getContinueButtonText,
		isSubmitting,
		isWpcom,
	};
};
