import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ImportPlatformForwarder } from './components/importer-forwarding-details';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationOtherPlatform: Step = function ( { navigation } ) {
	const translate = useTranslate();

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
			<DocumentHead title={ translate( "Looks like there's been a mix-up" ) } />
			<StepContainer
				stepName="site-migration-other-platform"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( "Looks like there's been a mix-up" ) }
						subHeaderText={ translate(
							'Our migration service is for WordPress sites. But don’t worry — our Squarespace import tool is ready to bring your content to WordPress.com. '
						) }
						align="center"
					/>
				}
				stepContent={ <ImportPlatformForwarder onSubmit={ handleSubmit } onSkip={ handleSkip } /> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationOtherPlatform;
