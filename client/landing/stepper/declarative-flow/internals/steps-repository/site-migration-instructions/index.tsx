import { LaunchpadContainer } from '@automattic/launchpad';
import { StepContainer } from '@automattic/onboarding';
import React from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Questions } from './questions';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const sidebar = <div>Sidebar</div>;

	const stepContent = (
		<LaunchpadContainer sidebar={ sidebar }>
			<div>New migration instructions!</div>
		</LaunchpadContainer>
	);

	const questions = <Questions />;

	return (
		<StepContainer
			stepName="site-migration-instructions"
			isFullLayout
			className="is-step-site-migration-instructions"
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			customizedActionButtons={ questions }
		/>
	);
};

export default SiteMigrationInstructions;
