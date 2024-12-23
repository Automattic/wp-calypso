import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsForm } from './components/credentials-form';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationFallbackCredentials: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const siteURL = useQuery().get( 'from' ) || '';

	// Removes "https://" or "http://" from URL
	const cleanUrl = siteURL.replace( /^(https?:\/\/)?(.*?)(\/)?$/, '$2' );

	const handleSubmit = ( from?: string ) => {
		const action = 'submit';
		return navigation.submit?.( { action, from } );
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
				stepName="site-migration-fallback-credentials"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Securely share your credentials' ) }
						subHeaderText={ translate(
							'Enter your login details for a WordPress Admin so we can temporarily access {{b}}%s{{/b}} and start migrating it to WordPress.com.',
							{ components: { b: <strong /> }, args: cleanUrl }
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

export default SiteMigrationFallbackCredentials;
