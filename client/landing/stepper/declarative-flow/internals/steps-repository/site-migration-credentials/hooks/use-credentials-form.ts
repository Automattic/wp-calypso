import { isEnabled } from '@automattic/calypso-config';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wp from 'calypso/lib/wp';
import { CredentialsFormData, ApplicationPasswordsInfo } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useRequestAutomatedMigration } from './use-request-automated-migration';

export const analyzeUrl = async ( domain: string ): Promise< UrlData | undefined > => {
	try {
		return await wp.req.get( {
			path: '/imports/analyze-url?site_url=' + encodeURIComponent( domain ),
			apiNamespace: 'wpcom/v2',
		} );
	} catch ( error ) {
		return undefined;
	}
};

export const getApplicationPasswordsInfo = async (
	siteId: number,
	from: string
): Promise< ApplicationPasswordsInfo | undefined > => {
	try {
		return await wp.req.get( {
			path:
				`/sites/${ siteId }/automated-migration/application-passwords/authorization-url?source=${ encodeURIComponent(
					from
				) }` + encodeURIComponent( from ),
			apiNamespace: 'wpcom/v2',
		} );
	} catch ( error ) {
		return undefined;
	}
};

const isNotWordPress = ( siteInfo?: UrlData ) => {
	return !! siteInfo?.platform && siteInfo?.platform !== 'wordpress';
};

const isWPCOM = ( siteInfo?: UrlData ) => {
	return !! siteInfo?.platform_data?.is_wpcom;
};

const getFormDefaultValues = ( fromUrl: string ): CredentialsFormData => {
	return {
		from_url: fromUrl,
		username: '',
		password: '',
		backupFileLocation: '',
		notes: '',
		migrationType: 'credentials',
	};
};

export const useCredentialsForm = (
	onSubmit: ( siteInfo?: UrlData, applicationPasswordsInfo?: ApplicationPasswordsInfo ) => void
) => {
	const isApplicationPasswordEnabled = isEnabled( 'automated-migration/application-password' );
	const siteSlug = useSiteSlugParam();
	const importSiteQueryParam = useQuery().get( 'from' ) || '';
	const [ siteInfo, setSiteInfo ] = useState< UrlData | undefined >( undefined );
	const [ isBusy, setIsBusy ] = useState( false );
	const siteId = parseInt( useSiteIdParam() ?? '' );

	const {
		mutateAsync: requestAutomatedMigration,
		error,
		variables,
		reset,
	} = useRequestAutomatedMigration( siteSlug );

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
		defaultValues: getFormDefaultValues( importSiteQueryParam ),
		errors: serverSideError,
	} );

	const accessMethod = watch( 'migrationType' );

	useEffect( () => {
		setIsBusy( isSubmitting );
	}, [ isSubmitting ] );

	const isLoginFailed =
		error?.code === 'automated_migration_tools_login_and_get_cookies_test_failed';
	const canBypassVerification = isLoginFailed || isWPCOM( siteInfo ) || isNotWordPress( siteInfo );
	const shouldAnalyzeUrl = ! isLoginFailed && accessMethod === 'credentials';

	const requestAutomatedMigrationAndSubmit = useCallback(
		async ( data: CredentialsFormData, siteInfoResult?: UrlData ) => {
			try {
				const payload = {
					...data,
					bypassVerification: canBypassVerification,
				};
				await requestAutomatedMigration( payload );
				recordTracksEvent( 'calypso_site_migration_automated_request_success' );
				onSubmit( siteInfoResult );
			} catch ( error ) {
				recordTracksEvent( 'calypso_site_migration_automated_request_error' );
			}
		},
		[ canBypassVerification, onSubmit, requestAutomatedMigration ]
	);

	const submitWithApplicationPassword = useCallback(
		async ( siteId: number, from: string, siteInfoResult: UrlData ) => {
			if ( isWPCOM( siteInfoResult ) || isNotWordPress( siteInfoResult ) ) {
				onSubmit( siteInfoResult );
			} else {
				const applicationPasswordsInfoResult = await getApplicationPasswordsInfo( siteId, from );
				onSubmit( siteInfoResult, applicationPasswordsInfoResult );
			}
		},
		[ onSubmit ]
	);

	const submitHandler = handleSubmit( async ( data: CredentialsFormData ) => {
		clearErrors();

		const siteInfoResult = shouldAnalyzeUrl ? await analyzeUrl( data.from_url ) : siteInfo;
		setSiteInfo( siteInfoResult );

		if ( isApplicationPasswordEnabled && accessMethod === 'credentials' && siteInfoResult ) {
			await submitWithApplicationPassword( siteId, data.from_url, siteInfoResult );
		} else {
			await requestAutomatedMigrationAndSubmit( data, siteInfoResult );
		}
	} );

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
		errors,
		control,
		handleSubmit,
		submitHandler,
		accessMethod,
		isBusy,
		canBypassVerification,
	};
};
