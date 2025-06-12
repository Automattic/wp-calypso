import { Step, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { shouldUseStepContainerV2MigrationFlow } from 'calypso/landing/stepper/declarative-flow/helpers/should-use-step-container-v2';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsForm } from './components/credentials-form';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationFallbackCredentials: StepType< {
	submits:
		| {
				action: 'submit' | 'skip';
				from?: string;
		  }
		| undefined;
} > = function ( { navigation, flow } ) {
	const translate = useTranslate();
	const siteURL = useQuery().get( 'from' ) || '';
	const isUsingStepContainerV2 = shouldUseStepContainerV2MigrationFlow( flow );

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

	const title = translate( 'Tell us about your WordPress site' );
	const headerText = translate( 'Securely share your credentials' );
	const subHeaderText = translate(
		'Enter your login details for a WordPress Admin so we can temporarily access {{b}}%s{{/b}} and start migrating it to WordPress.com.',
		{ components: { b: <strong /> }, args: cleanUrl }
	);
	const content = <CredentialsForm onSubmit={ handleSubmit } onSkip={ handleSkip } />;

	if ( isUsingStepContainerV2 ) {
		return (
			<>
				<DocumentHead title={ title } />
				<Step.CenteredColumnLayout
					columnWidth={ 5 }
					topBar={
						<Step.TopBar leftElement={ <Step.BackButton onClick={ navigation.goBack } /> } />
					}
					heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
				>
					{ content }
				</Step.CenteredColumnLayout>
			</>
		);
	}

	return (
		<>
			<DocumentHead title={ title } />
			<StepContainer
				stepName="site-migration-fallback-credentials"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ headerText }
						subHeaderText={ subHeaderText }
						align="center"
					/>
				}
				stepContent={ content }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationFallbackCredentials;
