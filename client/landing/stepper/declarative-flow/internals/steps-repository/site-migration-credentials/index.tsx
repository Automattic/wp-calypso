import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { UrlData } from 'calypso/blocks/import/types';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { MigrationStatus } from 'calypso/data/site-migration/landing/types';
import { useUpdateMigrationStatus } from 'calypso/data/site-migration/landing/use-update-migration-status';
import { useSiteIdParam } from 'calypso/landing/stepper/hooks/use-site-id-param';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsForm } from './components/credentials-form';
import { ApplicationPasswordsInfo } from './types';
import type { Step } from '../../types';
import './style.scss';

const getAction = ( siteInfo?: UrlData, applicationPasswordsInfo?: ApplicationPasswordsInfo ) => {
	if ( ! siteInfo ) {
		return 'submit';
	}

	if ( applicationPasswordsInfo?.isAvailable ) {
		return 'application-passwords-approval';
	}

	if ( siteInfo?.platform_data?.is_wpcom ) {
		return 'already-wpcom';
	}

	if ( siteInfo?.platform && siteInfo?.platform !== 'wordpress' ) {
		return 'site-is-not-using-wordpress';
	}

	return 'submit';
};

const SiteMigrationCredentials: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const siteId = parseInt( useSiteIdParam() ?? '' );

	const { mutate: updateMigrationStatus } = useUpdateMigrationStatus( siteId );

	const handleSubmit = (
		siteInfo?: UrlData | undefined,
		applicationPasswordsInfo?: ApplicationPasswordsInfo
	) => {
		const action = getAction( siteInfo, applicationPasswordsInfo );
		return navigation.submit?.( { action, from: siteInfo?.url, platform: siteInfo?.platform } );
	};

	const handleSkip = () => {
		return navigation.submit?.( {
			action: 'skip',
		} );
	};

	useEffect( () => {
		if ( siteId ) {
			updateMigrationStatus( { status: MigrationStatus.PENDING_DIFM } );
		}
	}, [ siteId, updateMigrationStatus ] );

	const subHeaderText = isEnabled( 'automated-migration/application-password' )
		? translate( 'Help us get started by providing some basic details about your current website.' )
		: translate(
				'Please share the following details to access your site and start your migration to WordPress.com.'
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
				stepContent={ <CredentialsForm onSubmit={ handleSubmit } onSkip={ handleSkip } /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationCredentials;
