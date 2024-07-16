import { StepContainer } from '@automattic/onboarding';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationStarted: Step = function () {
	const translate = useTranslate();

	const stepContent = <div>Migration started</div>;

	return (
		<StepContainer
			stepName="site-migration-started"
			isFullLayout
			formattedHeader={
				<FormattedHeader
					headerText={ translate( 'Migration started' ) }
					subHeaderText={
						<>
							{ translate( 'Your migration process has started.' ) }
							<br />
							{ translate( ' Migrate Guru will email you when the process is finished.' ) }
						</>
					}
					align="center"
					subHeaderAlign="center"
				/>
			}
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationStarted;
