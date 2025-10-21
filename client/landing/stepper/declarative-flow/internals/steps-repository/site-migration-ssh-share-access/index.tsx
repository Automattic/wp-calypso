import { NextButton, StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationSshShareAccess: Step< {
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
			<p>{ translate( 'SSH Share Access - Coming Soon' ) }</p>
			<NextButton onClick={ handleContinue }>{ translate( 'Continue' ) }</NextButton>
		</div>
	);

	return (
		<StepContainer
			stepName="site-migration-ssh-share-access"
			isFullLayout
			formattedHeader={
				<FormattedHeader
					headerText={ translate( 'Share SSH Access' ) }
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

export default SiteMigrationSshShareAccess;
