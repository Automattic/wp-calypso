import { Step } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import {
	recordMigrationCredentialsEvent,
	recordMigrationRequestSubmittedFacebookEvent,
} from 'calypso/lib/analytics/ad-tracking/record-migration-events';
import { NeedHelpLink } from '../site-migration-credentials/components/need-help-link';
import { useRequestMigrationHelp } from '../site-migration-credentials/hooks/use-request-migration-help';
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
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const siteURL = useQuery().get( 'from' ) || '';
	const handleSkip = useRequestMigrationHelp( () => navigation.submit?.( { action: 'skip' } ) );

	// Removes "https://" or "http://" from URL
	const cleanUrl = siteURL.replace( /^(https?:\/\/)?(.*?)(\/)?$/, '$2' );

	const handleSubmit = ( from?: string ) => {
		const action = 'submit';

		// Fire Google Ads tracking event when credentials are submitted
		recordMigrationCredentialsEvent( 'SiteMigrationFallbackCredentials' );
		recordMigrationRequestSubmittedFacebookEvent( 'SiteMigrationFallbackCredentials' );

		return navigation.submit?.( { action, from } );
	};

	const title = translate( 'Tell us about your WordPress site' );
	const headerText = translate( 'Securely share your credentials' );
	const subHeaderText = translate(
		'Enter your login details for a WordPress Admin so we can temporarily access {{b}}%s{{/b}} and start migrating it to WordPress.com.',
		{ components: { b: <strong /> }, args: cleanUrl }
	);
	const content = <CredentialsForm onSubmit={ handleSubmit } />;

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
						rightElement={ <NeedHelpLink onHelpLinkClicked={ handleSkip } /> }
					/>
				}
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			>
				{ content }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationFallbackCredentials;
