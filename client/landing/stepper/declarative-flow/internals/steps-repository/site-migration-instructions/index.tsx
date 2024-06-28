import { LaunchpadContainer } from '@automattic/launchpad';
import { StepContainer } from '@automattic/onboarding';
import { getQueryArg } from '@wordpress/url';
import React from 'react';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { HostingBadge } from './hosting-badge';
import { Questions } from './questions';
import { Sidebar } from './sidebar';
import { SitePreview } from './site-preview';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const importSiteQueryParam = getQueryArg( window.location.href, 'from' )?.toString() || '';
	const { data: hostingDetails } = useHostingProviderUrlDetails( importSiteQueryParam );
	const showHostingBadge = ! hostingDetails.is_unknown && ! hostingDetails.is_a8c;

	const sidebar = <Sidebar />;
	const stepContent = (
		<LaunchpadContainer sidebar={ sidebar }>
			{ showHostingBadge && <HostingBadge hostingName={ hostingDetails.name } /> }

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
