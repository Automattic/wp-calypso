import { StepContainer } from '@automattic/onboarding';
import React from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const SiteMigrationStarted: Step = function () {
	const stepContent = <div>Migration started</div>;

	return (
		<StepContainer
			stepName="site-migration-started"
			isFullLayout
			hideFormattedHeader
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default SiteMigrationStarted;
