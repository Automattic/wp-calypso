import { LaunchpadContainer } from '@automattic/launchpad';
import { StepContainer } from '@automattic/onboarding';
import React from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { Questions } from './questions';
import { Sidebar } from './sidebar';
import { SitePreview } from './site-preview';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const sidebar = <Sidebar />;

	const stepContent = (
		<LaunchpadContainer sidebar={ sidebar }>
			<SitePreview />
		</LaunchpadContainer>
	);

	const questions = <Questions />;

	return (
		<StepContainer
			stepName="site-migration-instructions"
			isFullLayout
			hideFormattedHeader
			className="is-step-site-migration-instructions site-migration-instructions--launchpad"
			hideSkip
			hideBack
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			customizedActionButtons={ questions }
		/>
	);
};

export default SiteMigrationInstructions;
