import { captureException } from '@automattic/calypso-sentry';
import { CircularProgressBar } from '@automattic/components';
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
import { MigrationInstructions } from './migration-instructions';
import { Provisioning } from './provisioning';
import { Questions } from './questions';
import { SitePreview } from './site-preview';
import { Steps } from './steps';
import { useSteps } from './steps/use-steps';
import type { Status } from './provisioning';
import type { Step } from '../../types';
import './style.scss';

interface PreparationEventsHookOptions {
	migrationKeyStatus: Status;
	preparationCompleted: boolean;
	preparationError: Error | null;
	fromUrl: string;
	flow: string;
	siteId: number;
}

const usePreparationEventsAndLogs = ( {
	migrationKeyStatus,
	preparationCompleted,
	preparationError,
	fromUrl,
	flow,
	siteId,
}: PreparationEventsHookOptions ) => {
	useEffect( () => {
		if ( 'error' === migrationKeyStatus ) {
			recordTracksEvent(
				'calypso_onboarding_site_migration_instructions_unable_to_get_migration_key',
				{
					from: fromUrl,
				}
			);
		}
	}, [ migrationKeyStatus, fromUrl ] );

	useEffect( () => {
		if ( preparationCompleted ) {
			recordTracksEvent( 'calypso_site_migration_instructions_preparation_complete' );
		}
	}, [ preparationCompleted ] );

	useEffect( () => {
		if ( preparationError ) {
			const logError = preparationError as unknown as { path: string; message: string };

			captureException( preparationError, {
				extra: {
					message: logError?.message,
					path: logError?.path,
				},
				tags: {
					blog_id: siteId,
					calypso_section: 'setup',
					flow,
					stepName: 'site-migration-instructions',
					context: 'failed_to_prepare_site_for_migration',
				},
			} );
		}
	}, [ flow, preparationError, siteId ] );
};

const SiteMigrationInstructions: Step = function ( { navigation, flow } ) {
	const site = useSite();
	const siteId = site?.ID ?? 0;
	const queryParams = useQuery();
	const fromUrl = queryParams.get( 'from' ) ?? '';

	// Delete migration sticker.
	const { deleteMigrationSticker } = useMigrationStickerMutation();
	useEffect( () => {
		if ( siteId ) {
			deleteMigrationSticker( siteId );
		}
	}, [ deleteMigrationSticker, siteId ] );

	// Site preparation.
	const {
		detailedStatus,
		completed: preparationCompleted,
		error: preparationError,
		migrationKey,
	} = usePrepareSiteForMigration( siteId );
	const migrationKeyStatus = detailedStatus.migrationKey;

	// Register events and logs.
	usePreparationEventsAndLogs( {
		migrationKeyStatus,
		preparationCompleted,
		preparationError,
		fromUrl,
		flow,
		siteId,
	} );

	// Hosting details.
	const { data: hostingDetails } = useHostingProviderUrlDetails( fromUrl );
	const showHostingBadge = ! hostingDetails.is_unknown && ! hostingDetails.is_a8c;

	// Steps.
	const onCompleteSteps = () => {
		navigation.submit?.( { destination: 'migration-started' } );
	};

	const showMigrationKeyFallback = migrationKeyStatus === 'error' && preparationCompleted;

	const { steps, completedSteps } = useSteps( {
		fromUrl,
		migrationKey: migrationKey ?? '',
		showMigrationKeyFallback,
		onComplete: onCompleteSteps,
	} );

	const withPreview = fromUrl !== '';

	const migrationInstructions = (
		<MigrationInstructions
			withPreview={ withPreview }
			progress={
				<CircularProgressBar
					size={ 40 }
					enableDesktopScaling
					numberOfSteps={ steps.length }
					currentStep={ completedSteps }
				/>
			}
		>
			<div className="site-migration-instructions__steps">
				<Steps steps={ steps } />
			</div>
			<Provisioning status={ detailedStatus } />
		</MigrationInstructions>
	);

	const stepContent = withPreview ? (
		<LaunchpadContainer sidebar={ migrationInstructions }>
			{ showHostingBadge && <HostingBadge hostingName={ hostingDetails.name } /> }
			<SitePreview />
		</LaunchpadContainer>
	) : (
		<div className="site-migration-instructions__container-without-preview">
			{ migrationInstructions }
		</div>
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
