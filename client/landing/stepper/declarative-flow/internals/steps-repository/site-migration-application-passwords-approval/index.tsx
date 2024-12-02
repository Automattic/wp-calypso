import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationApplicationPasswordsApproval: Step = function ( { navigation } ) {
	const translate = useTranslate();

	return (
		<>
			<DocumentHead title={ translate( 'Get ready for blazing fast speeds' ) } />
			<StepContainer
				stepName="site-migration-approval"
				flowName="site-migration"
				goBack={ navigation?.goBack }
				goNext={ navigation?.submit }
				hideSkip
				isFullLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-credentials-header"
						headerText={ translate( 'Get ready for blazing fast speeds' ) }
						subHeaderText={ translate(
							'Help us get started by providing some basic details about your current website.'
						) }
						align="center"
					/>
				}
				stepContent={ <></> }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationApplicationPasswordsApproval;
