import config from '@automattic/calypso-config';
import { useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import DocumentHead from 'calypso/components/data/document-head';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/landing/use-update-migration-status';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import {
	recordMigrationCredentialsEvent,
	recordMigrationRequestSubmittedFacebookEvent,
} from 'calypso/lib/analytics/ad-tracking/record-migration-events';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { resetSite } from 'calypso/state/sites/actions';
import { isHostingSupportedForSSHMigration } from '../site-migration-ssh-share-access/utils/hosting-provider-validation';
import { CredentialsForm } from './components/credentials-form';
import { NeedHelpLink } from './components/need-help-link';
import { ApplicationPasswordsInfo } from './types';
import type { Step as StepType } from '../../types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';
import './style.scss';

const getAction = ( siteInfo?: UrlData, applicationPasswordsInfo?: ApplicationPasswordsInfo ) => {
	if ( ! siteInfo ) {
		return 'submit';
	}

	if ( applicationPasswordsInfo?.application_passwords_enabled ) {
		return 'application-passwords-approval';
	}

	if ( applicationPasswordsInfo?.application_passwords_enabled === false ) {
		return 'credentials-required';
	}

	if ( siteInfo?.platform_data?.is_wpcom ) {
		return 'already-wpcom';
	}

	if ( siteInfo?.platform && siteInfo?.platform !== 'wordpress' ) {
		return 'site-is-not-using-wordpress';
	}

	return 'submit';
};

const SiteMigrationCredentials: StepType< {
	submits: {
		action:
			| 'submit'
			| 'application-passwords-approval'
			| 'credentials-required'
			| 'already-wpcom'
			| 'site-is-not-using-wordpress'
			| 'redirect-to-ssh'
			| 'skip';
		from?: string;
		platform?: ImporterPlatform;
		authorizationUrl?: string;
		hasError?: 'ticket-creation';
		host?: string;
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const siteId = parseInt( useSiteIdParam() ?? '' );
	const dispatch = useDispatch();
	const fromUrl = useQuery().get( 'from' ) || '';

	const { mutate: updateMigrationStatus } = useUpdateMigrationStatus( siteId );

	const locale = useLocale();
	const siteSlugParam = useSiteSlugParam();
	const siteSlug = siteSlugParam ?? '';
	const { sendTicketAsync } = useSubmitMigrationTicket( {
		onSuccess: () => {
			recordTracksEvent( 'calypso_migration_credentials_ticket_submit_success', {
				blog_url: siteSlug,
				from_url: fromUrl,
			} );
		},
		onError: ( error ) => {
			recordTracksEvent( 'calypso_migration_credentials_ticket_submit_error', {
				blog_url: siteSlug,
				from_url: fromUrl,
				error: error.message,
			} );
			navigation.submit?.( {
				action: 'skip',
				hasError: 'ticket-creation',
				from: fromUrl,
			} );
		},
	} );

	const handleSubmit = (
		siteInfo?: UrlData | undefined,
		applicationPasswordsInfo?: ApplicationPasswordsInfo,
		hostingProviderSlug?: string
	) => {
		const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );
		const isHostingSupported = isHostingSupportedForSSHMigration( hostingProviderSlug );

		// If SSH migration is available and hosting is supported, redirect to SSH flow
		if ( isSSHMigrationAvailable && isHostingSupported ) {
			siteId && dispatch( resetSite( siteId ) );
			return navigation.submit?.( {
				action: 'redirect-to-ssh',
				from: siteInfo?.url || fromUrl,
				host: hostingProviderSlug,
			} );
		}

		const action = getAction( siteInfo, applicationPasswordsInfo );

		// Fire Google Ads tracking event when credentials are submitted
		recordMigrationCredentialsEvent( 'SiteMigrationCredentials' );
		recordMigrationRequestSubmittedFacebookEvent( 'SiteMigrationCredentials' );

		siteId && dispatch( resetSite( siteId ) );
		return navigation.submit?.( {
			action,
			from: siteInfo?.url,
			platform: siteInfo?.platform,
			authorizationUrl: applicationPasswordsInfo?.authorization_url,
		} );
	};

	const handleSkip = async () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
			automated_migration: true,
		} );

		// Fire Google Ads tracking event when credentials are skipped
		recordMigrationCredentialsEvent( 'SiteMigrationCredentials' );

		try {
			await sendTicketAsync( {
				locale,
				from_url: fromUrl,
				blog_url: siteSlug,
			} );

			// Reset the site in the state to ensure the correct overview screen is shown.
			siteId && dispatch( resetSite( siteId ) );

			return navigation.submit?.( {
				action: 'skip',
			} );
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'There was an error submitting the ticket', error );
		}
	};

	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( { status: MigrationStatus.STARTED_DIFM } );
		}
	}, [ siteId, updateMigrationStatus ] );

	const title = translate( 'Tell us about your WordPress site' );
	const subHeaderText = translate(
		'Help us get started by providing some basic details about your current website.'
	);
	const mainForm = <CredentialsForm onSubmit={ handleSubmit } />;
	const skipButton = <NeedHelpLink onHelpLinkClicked={ handleSkip } />;

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 5 }
				topBar={
					<Step.TopBar
						leftElement={
							navigation?.goBack ? <Step.BackButton onClick={ navigation.goBack } /> : null
						}
						rightElement={ skipButton }
					/>
				}
				heading={ <Step.Heading text={ title } subText={ subHeaderText } /> }
				className="site-migration-credentials-v2"
			>
				{ mainForm }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationCredentials;
