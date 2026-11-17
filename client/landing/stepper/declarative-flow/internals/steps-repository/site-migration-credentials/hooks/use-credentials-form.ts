import { analyzeSiteMigrationSource, setupSiteMigrationAuthorization } from '@automattic/api-core';
import { useLocale } from '@automattic/i18n-utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UrlData } from 'calypso/blocks/import/types';
import {
	getErrorCode,
	MIGRATION_TICKET_ERROR_CODES,
	useMigrationTicketErrorMessage,
} from 'calypso/landing/stepper/hooks/use-migration-ticket-error-message';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFlowState, type AnyFlowInitialize } from '../../../state-manager/store';
import { CredentialsFormData, ApplicationPasswordsInfo } from '../types';
import { useFormErrorMapping } from './use-form-error-mapping';
import { useRequestAutomatedMigration } from './use-request-automated-migration';

export const analyzeUrl = async ( domain: string ): Promise< UrlData | undefined > => {
	try {
		return await analyzeSiteMigrationSource< UrlData >( domain );
	} catch ( error ) {
		return undefined;
	}
};

export const getApplicationPasswordsInfo = async (
	siteId: number,
	from: string
): Promise< ApplicationPasswordsInfo | undefined > => {
	try {
		return await setupSiteMigrationAuthorization( siteId, from );
	} catch ( error ) {
		const code = getErrorCode( error );
		if ( code === 'failed_to_get_authorization_path' ) {
			return {
				application_passwords_enabled: false,
			};
		}
		// No ticket means our team never hears about the migration, so the customer must find out.
		if ( code && MIGRATION_TICKET_ERROR_CODES.includes( code ) ) {
			throw error;
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
	onSubmit: ( siteInfo?: UrlData, applicationPasswordsInfo?: ApplicationPasswordsInfo ) => void
) => {
	const siteSlug = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const lastSubmittedUrl = useRef( removeEndingSlash( fromUrl ) );
	const { set } = useFlowState< AnyFlowInitialize >();
	const [ siteInfo, setSiteInfo ] = useState< UrlData | undefined >( undefined );
	const [ isBusy, setIsBusy ] = useState( false );
	const siteId = parseInt( useSiteIdParam() ?? '' );
	const locale = useLocale();
	const { sendTicketAsync, isPending: isSendingTicket } = useSubmitMigrationTicket();
	const getTicketErrorMessage = useMigrationTicketErrorMessage();

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
		setError,
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
			let applicationPasswordsInfoResult: ApplicationPasswordsInfo | undefined;

			// Only the ticket and setup requests go in the try, so a failure after the ticket was
			// filed isn't reported as a ticket failure and doesn't invite a duplicate request.
			try {
				if ( isWPCOM( siteInfoResult ) ) {
					if ( ! siteSlug ) {
						return;
					}
					await sendTicketAsync( {
						locale,
						blog_url: siteSlug,
						from_url: from,
					} );
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
				} else {
					applicationPasswordsInfoResult = await getApplicationPasswordsInfo( siteId, from );
				}
			} catch ( error ) {
				recordTracksEvent( 'calypso_site_migration_ticket_error', {
					error_code: getErrorCode( error ),
				} );
				setError( 'root', { type: 'ticket', message: getTicketErrorMessage( error ) } );
				return;
			}

			onSubmit( siteInfoResult, applicationPasswordsInfoResult );
		},
		[ locale, onSubmit, siteSlug, sendTicketAsync, setError, getTicketErrorMessage ]
	);

	const submitHandler = handleSubmit( async ( data: CredentialsFormData ) => {
		clearErrors();
		if ( accessMethod === 'credentials' && data.from_url !== lastSubmittedUrl.current ) {
			set( 'migrationSourceUrl', data.from_url );
			lastSubmittedUrl.current = data.from_url;
		}

		const siteInfoResult = shouldAnalyzeUrl ? await analyzeUrl( data.from_url ) : siteInfo;
		setSiteInfo( siteInfoResult );

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
