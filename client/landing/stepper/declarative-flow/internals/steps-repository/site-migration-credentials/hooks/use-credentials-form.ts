import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToDomain } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';
import { isHostingSupportedForSSHMigration } from '../../site-migration-ssh-share-access/utils/hosting-provider-validation';
import { CredentialsFormData, ApplicationPasswordsInfo, ApiError } from '../types';
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

export const getHostingProvider = async ( domain: string ): Promise< string | undefined > => {
	try {
		const response = await wp.req.get( {
			path: '/site-profiler/hosting-provider/' + encodeURIComponent( domain ),
			apiNamespace: 'wpcom/v2',
		} );
		return response?.hosting_provider?.slug;
	} catch ( error ) {
		return undefined;
	}
};

export const getApplicationPasswordsInfo = async (
	siteId: number,
	from: string
): Promise< ApplicationPasswordsInfo | undefined > => {
	try {
		return await wp.req.post( {
			path: `/sites/${ siteId }/automated-migration/application-passwords/setup`,
			apiNamespace: 'wpcom/v2',
			body: {
				source: from,
			},
		} );
	} catch ( error ) {
		if ( ( error as ApiError )?.code === 'failed_to_get_authorization_path' ) {
			return {
				application_passwords_enabled: false,
			};
		}
		return undefined;
	}
};

const isNotWordPress = ( siteInfo?: UrlData ) => {
	return !! siteInfo?.platform && siteInfo?.platform !== 'wordpress';
};

const isWPCOM = ( siteInfo?: UrlData ) => {
	return !! siteInfo?.platform_data?.is_wpcom;
};

const removeEndingSlash = ( url: string ) => {
	try {
		const urlObject = new globalThis.URL( url );
		if ( urlObject.pathname === '/' && url.endsWith( '/' ) ) {
			return url.slice( 0, -1 );
		}
	} catch {
		if ( url.endsWith( '/' ) ) {
			return url.slice( 0, -1 );
		}
	}

	return url;
};

export const useCredentialsForm = (
	onSubmit: (
		siteInfo?: UrlData,
		applicationPasswordsInfo?: ApplicationPasswordsInfo,
		hostingProviderSlug?: string
	) => void
) => {
	const siteSlug = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const [ siteInfo, setSiteInfo ] = useState< UrlData | undefined >( undefined );
	const [ isBusy, setIsBusy ] = useState( false );
	const siteId = parseInt( useSiteIdParam() ?? '' );
	const locale = useLocale();
	const { sendTicketAsync, isPending: isSendingTicket } = useSubmitMigrationTicket();

	const {
		mutateAsync: requestAutomatedMigration,
		error,
		variables,
		reset,
	} = useRequestAutomatedMigration( siteSlug );

	const serverSideError = useFormErrorMapping( error, variables );

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
			from_url: removeEndingSlash( fromUrl ),
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
		setIsBusy( isSubmitting || isSendingTicket );
	}, [ isSubmitting, isSendingTicket ] );

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
				recordTracksEvent( 'calypso_site_migration_automated_request_success', {
					migration_type: data.migrationType,
				} );
				onSubmit( siteInfoResult );
			} catch ( error ) {
				recordTracksEvent( 'calypso_site_migration_automated_request_error', {
					migration_type: data.migrationType,
				} );
			}
		},
		[ canBypassVerification, onSubmit, requestAutomatedMigration ]
	);

	const submitWithApplicationPassword = useCallback(
		async ( siteId: number, from: string, siteInfoResult: UrlData ) => {
			if ( isWPCOM( siteInfoResult ) ) {
				if ( ! siteSlug ) {
					return;
				}
				await sendTicketAsync( {
					locale,
					blog_url: siteSlug,
					from_url: from,
				} );
				onSubmit( siteInfoResult );
			} else if ( isNotWordPress( siteInfoResult ) ) {
				if ( ! siteSlug ) {
					return;
				}
				await sendTicketAsync( {
					locale,
					blog_url: siteSlug,
					from_url: from,
					context: 'site_is_not_wordpress',
				} );
				onSubmit( siteInfoResult );
			} else {
				const applicationPasswordsInfoResult = await getApplicationPasswordsInfo( siteId, from );
				onSubmit( siteInfoResult, applicationPasswordsInfoResult );
			}
		},
		[ locale, onSubmit, siteSlug, sendTicketAsync ]
	);

	const submitToSSHMigrationFlow = useCallback(
		( siteInfoResult: UrlData, hostingProviderSlug: string ) => {
			recordTracksEvent( 'calypso_site_migration_hosting_detected', {
				hosting_provider: hostingProviderSlug,
				is_ssh_supported: true,
				ssh_feature_enabled: true,
				redirected_to_ssh: true,
				step: 'credentials',
			} );

			onSubmit( siteInfoResult, undefined, hostingProviderSlug );
		},
		[ onSubmit ]
	);

	const submitHandler = handleSubmit( async ( data: CredentialsFormData ) => {
		clearErrors();

		const siteInfoResult = shouldAnalyzeUrl ? await analyzeUrl( data.from_url ) : siteInfo;
		setSiteInfo( siteInfoResult );

		// Fetch hosting provider after analyzing the URL
		let hostingProviderSlug: string | undefined;
		if ( siteInfoResult?.url ) {
			const domain = urlToDomain( siteInfoResult.url );
			hostingProviderSlug = await getHostingProvider( domain );
		}

		// Check if SSH migration is available and hosting is supported
		const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );
		const isHostingSupported = isHostingSupportedForSSHMigration( hostingProviderSlug );

		if ( isSSHMigrationAvailable && isHostingSupported && hostingProviderSlug && siteInfoResult ) {
			return submitToSSHMigrationFlow( siteInfoResult, hostingProviderSlug );
		}

		if ( accessMethod === 'credentials' && siteInfoResult ) {
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
		clearErrors,
		accessMethod,
		isBusy,
		canBypassVerification,
	};
};
