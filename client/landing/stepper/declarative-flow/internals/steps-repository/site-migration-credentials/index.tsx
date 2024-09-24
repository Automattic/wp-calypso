import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { CredentialsForm } from './components/credentials-form';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationCredentials: Step = function ( { navigation } ) {
	const translate = useTranslate();
	const isEnglishLocale = useIsEnglishLocale();

	const handleSubmit = () => {
		return navigation.submit?.();
	};

	const handleSkip = () => {
		return navigation.submit?.( {
			action: 'skip',
		} );
	};

	return (
		<>
			<DocumentHead
				title={
					isEnglishLocale
						? translate( 'Tell us about your WordPress site' )
						: translate( 'Tell us about your site' )
				}
			/>
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
						headerText={
							isEnglishLocale
								? translate( 'Tell us about your WordPress site' )
								: translate( 'Tell us about your site' )
						}
						subHeaderText={
							isEnglishLocale
								? translate(
										'Please share the following details to access your site and start your migration to WordPress.com.'
								  )
								: translate(
										'Please share the following details to access your site and start your migration.'
								  )
						}
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
