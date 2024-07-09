import { LaunchpadContainer } from '@automattic/launchpad';
import { StepContainer } from '@automattic/onboarding';
import React, { useEffect } from 'react';
import { useMigrationStickerMutation } from 'calypso/data/site-migration/use-migration-sticker';
import { useHostingProviderUrlDetails } from 'calypso/data/site-profiler/use-hosting-provider-url-details';
import { usePrepareSiteForMigration } from 'calypso/landing/stepper/hooks/use-prepare-site-for-migration';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { HostingBadge } from './hosting-badge';
import { Provisioning } from './provisioning';
import { Questions } from './questions';
import { Sidebar } from './sidebar';
import { SitePreview } from './site-preview';
import type { Step } from '../../types';
import './style.scss';

const SiteMigrationInstructions: Step = function () {
	const site = useSite();
	const siteId = site?.ID;
	const { deleteMigrationSticker } = useMigrationStickerMutation();

	const queryParams = useQuery();
	const importSiteQueryParam = queryParams.get( 'from' ) ?? '';
	const { data: hostingDetails } = useHostingProviderUrlDetails( importSiteQueryParam );
	const showHostingBadge = ! hostingDetails.is_unknown && ! hostingDetails.is_a8c;

	const site = useSite();
	const siteId = site?.ID;
	const { detailedStatus } = usePrepareSiteForMigration( siteId );

	const sidebar = (
		<Sidebar>
			<Provisioning status={ detailedStatus } />
		</Sidebar>
	);

	const stepContent = (
		<LaunchpadContainer sidebar={ sidebar }>
			{ showHostingBadge && <HostingBadge hostingName={ hostingDetails.name } /> }

			<SitePreview />
		</LaunchpadContainer>
	);

	useEffect( () => {
		if ( siteId ) {
			deleteMigrationSticker( siteId );
		}
	}, [ deleteMigrationSticker, siteId ] );

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
