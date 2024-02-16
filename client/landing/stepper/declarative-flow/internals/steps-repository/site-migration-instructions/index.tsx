import { StepContainer } from '@automattic/onboarding';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationInstructions: Step = function () {
	const stepContent = (
		<div>
			<p>Site migration instructions go here.</p>
		</div>
	);

	return (
		<>
			<DocumentHead title="Site migration instructions" />
			<StepContainer
				stepName="site-migration-instructions"
				shouldHideNavButtons={ false }
				className="is-step-site-migration-instructions"
				hideSkip={ true }
				hideBack={ true }
				isHorizontalLayout
				formattedHeader={
					<FormattedHeader
						id="site-migration-instructions-header"
						headerText="Site migration instructions"
						align="left"
					/>
				}
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default SiteMigrationInstructions;
