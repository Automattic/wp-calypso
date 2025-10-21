import { NextButton, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationSshInProgress: Step< {
	submits: {
		action: 'continue';
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();

	const handleContinue = () => {
		navigation.submit?.( { action: 'continue' } );
	};

	const stepContent = (
		<div>
			<p>{ translate( 'SSH Migration In Progress - Coming Soon' ) }</p>
			<NextButton onClick={ handleContinue }>{ translate( 'Go to Dashboard' ) }</NextButton>
		</div>
	);

	return (
		<StepContainer
			stepName="site-migration-ssh-in-progress"
			isFullLayout
			formattedHeader={
				<FormattedHeader
					headerText={ translate( 'Migration In Progress' ) }
					subHeaderText={ translate( 'This step is under development.' ) }
					align="center"
				/>
			}
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationSshInProgress;
