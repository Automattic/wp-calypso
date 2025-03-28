import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/landing/use-update-migration-status';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch } from 'calypso/state';
import { resetSite } from 'calypso/state/sites/actions';
import { CredentialsForm } from './components/credentials-form';
import { NeedHelpLink } from './components/need-help-link';
import { ApplicationPasswordsInfo } from './types';
import type { Step } from '../../types';
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

const SiteMigrationCredentials: Step< {
	submits: {
		action:
			| 'submit'
			| 'application-passwords-approval'
			| 'credentials-required'
			| 'already-wpcom'
			| 'site-is-not-using-wordpress'
			| 'skip';
		from?: string;
		platform?: ImporterPlatform;
		authorizationUrl?: string;
		hasError?: 'ticket-creation';
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const siteId = parseInt( useSiteIdParam() ?? '' );
	const dispatch = useDispatch();

	const { mutate: updateMigrationStatus } = useUpdateMigrationStatus( siteId );

	const locale = useLocale();
	const siteSlugParam = useSiteSlugParam();
	const fromUrl = useQuery().get( 'from' ) || '';
	const siteSlug = siteSlugParam ?? '';
	const { sendTicket } = useSubmitMigrationTicket( {
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
		applicationPasswordsInfo?: ApplicationPasswordsInfo
	) => {
		const action = getAction( siteInfo, applicationPasswordsInfo );
		siteId && dispatch( resetSite( siteId ) );
		return navigation.submit?.( {
			action,
			from: siteInfo?.url,
			platform: siteInfo?.platform,
			authorizationUrl: applicationPasswordsInfo?.authorization_url,
		} );
	};

	const handleSkip = () => {
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
			automated_migration: true,
		} );
		sendTicket( {
			locale,
			from_url: fromUrl,
			blog_url: siteSlug,
		} );

		return navigation.submit?.( {
			action: 'skip',
		} );
	};

	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( { status: MigrationStatus.STARTED_DIFM } );
		}
	}, [ siteId, updateMigrationStatus ] );

	const subHeaderText = translate(
		'Help us get started by providing some basic details about your current website.'
	);

	return (
		<>
			<DocumentHead title={ translate( 'Tell us about your WordPress site' ) } />
			<StepContainer
				stepName="site-migration-credentials"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Tell us about your WordPress site' ) }
						subHeaderText={ subHeaderText }
						align="center"
					/>
				}
				stepContent={ <CredentialsForm onSubmit={ handleSubmit } /> }
				recordTracksEvent={ recordTracksEvent }
				customizedActionButtons={ <NeedHelpLink onHelpLinkClicked={ handleSkip } /> }
			/>
		</>
	);
};

export default SiteMigrationCredentials;
