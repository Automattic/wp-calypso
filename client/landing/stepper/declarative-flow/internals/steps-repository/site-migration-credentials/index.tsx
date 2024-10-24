import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import { UrlData } from 'calypso/blocks/import/types';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsForm } from './components/credentials-form';
import type { Step } from '../../types';
import './style.scss';

const getAction = ( siteInfo?: UrlData ) => {
	if ( ! siteInfo ) {
		return 'submit';
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

	const handleSubmit = ( siteInfo?: UrlData | undefined ) => {
		const action = getAction( siteInfo );
		return navigation.submit?.( { action, from: siteInfo?.url, platform: siteInfo?.platform } );
	};

	const handleSkip = () => {
		return navigation.submit?.( {
			action: 'skip',
		} );
	};

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
						subHeaderText={ translate(
							'Please share the following details to access your site and start your migration to WordPress.com.'
						) }
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
