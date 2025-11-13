import { useLocale } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { useSubmitMigrationTicket } from 'calypso/landing/stepper/hooks/use-submit-migration-ticket';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToDomain } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { resetSite } from 'calypso/state/sites/actions';
import { SupportNudge } from '../site-migration-instructions/support-nudge';
import { useSSHMigrationStatus } from '../site-migration-ssh-in-progress/hooks/use-ssh-migration-status';
import { Accordion } from './components/accordion';
import { SshMigrationContainer } from './components/ssh-migration-container';
import { usePollSSHMigrationAtomicTransfer } from './hooks/use-poll-ssh-migration-atomic-transfer';
import { useRotatingLoadingMessages } from './hooks/use-rotating-loading-messages';
import { useStartSSHMigration } from './hooks/use-start-ssh-migration';
import { getSSHHostDisplayName } from './steps/ssh-host-support-urls';
import { useSteps } from './steps/use-steps';
import type { Step as StepType } from '../../types';

import './styles.scss';

const SiteMigrationSshShareAccess: StepType< {
	submits: {
		destination?:
			| 'migration-started'
			| 'migration-completed'
			| 'no-ssh-access'
			| 'back-to-verification'
			| 'do-it-for-me';
	};
} > = function ( { navigation } ) {
	const site = useSite();
	const siteId = site?.ID ?? 0;
	const queryParams = useQuery();
	const fromUrl = queryParams.get( 'from' ) ?? '';
	const host = queryParams.get( 'host' ) ?? undefined;
	const transferIdParam = queryParams.get( 'transferId' );
	const transferId = transferIdParam ? parseInt( transferIdParam, 10 ) : null;
	const [ migrationStarted, setMigrationStarted ] = useState( false );
	const [ shouldStartMigration, setShouldStartMigration ] = useState( false );
	const locale = useLocale();
	const siteSlug = useSiteSlugParam() ?? '';
	const { sendTicketAsync, isPending: isSubmittingTicket } = useSubmitMigrationTicket();

	// Redirect back to verification step if transferId is missing
	useEffect( () => {
		if ( ! transferId ) {
			navigation.submit?.( { destination: 'back-to-verification' } );
		}
	}, [ transferId, navigation ] );

	const handleNoSSHAccess = useCallback( () => {
		navigation.submit?.( { destination: 'no-ssh-access' } );
	}, [ navigation ] );

	const dispatch = useDispatch();
	const queryClient = useQueryClient();

	// Poll for migration status after starting migration
	const { data: migrationStatus } = useSSHMigrationStatus( {
		siteId,
		enabled: migrationStarted && siteId > 0,
	} );

	// Poll SSH migration atomic transfer status
	const { transferStatus, isTransferring } = usePollSSHMigrationAtomicTransfer(
		siteId,
		transferId,
		{
			enabled: !! transferId && siteId > 0,
			refetchInterval: 2000, // Poll every 2 seconds
		}
	);

	const { mutate: startMigration, isPending: isStartingMigration } = useStartSSHMigration();

	const { steps, formState, canStartMigration, onMigrationStarted, setMigrationError } = useSteps( {
		fromUrl,
		siteId,
		siteName: site?.name ?? '',
		host,
		onNoSSHAccess: handleNoSSHAccess,
		migrationStatus: migrationStatus?.status,
		isTransferring,
		isInputDisabled: isStartingMigration || migrationStarted || shouldStartMigration,
	} );

	// Redirect to in-progress step when status becomes 'migrating', or show error if failed
	useEffect( () => {
		if ( ! migrationStarted || ! migrationStatus ) {
			return;
		}

		if ( migrationStatus.status === 'migrating' ) {
			dispatch( resetSite( siteId ) );
			navigation.submit?.( { destination: 'migration-started' } );
		} else if ( migrationStatus.status === 'failed' ) {
			setMigrationError( new Error( 'Migration failed. Please try again.' ) );
			setMigrationStarted( false );
		} else if ( migrationStatus.status === 'completed' ) {
			navigation.submit?.( { destination: 'migration-completed' } );
		}
	}, [ migrationStarted, migrationStatus, dispatch, siteId, navigation, setMigrationError ] );

	const triggerSSHMigration = () => {
		// Reset the migration status query to clear any stale data from previous attempts
		queryClient.resetQueries( { queryKey: [ 'ssh-migration-status', siteId ] } );

		startMigration(
			{
				siteId,
				remoteHost: formState.serverAddress,
				remoteUser: formState.username,
				remoteDomain: fromUrl,
				remotePass: formState.authMethod === 'key' ? '' : formState.password,
			},
			{
				onSuccess: () => {
					onMigrationStarted();
					setMigrationStarted( true );
				},
				onError: ( error ) => {
					setMigrationError( error );
					setMigrationStarted( false );
				},
			}
		);
	};

	const handleContinue = () => {
		recordTracksEvent( 'calypso_site_migration_ssh_action', {
			step: 'share_access',
			action: 'click_button',
			button: 'continue',
		} );
		setMigrationError( null );

		if ( isTransferring ) {
			setShouldStartMigration( true );
			return;
		}

		triggerSSHMigration();
	};

	// Auto-start migration when verification completes
	useEffect( () => {
		if ( transferStatus === 'completed' && shouldStartMigration ) {
			setShouldStartMigration( false );
			triggerSSHMigration();
		}
	}, [ transferStatus, shouldStartMigration ] );

	const handleSkip = useCallback( async () => {
		recordTracksEvent( 'calypso_site_migration_ssh_action', {
			step: 'share_access',
			action: 'click_assisted_migration',
		} );
		recordTracksEvent( 'wpcom_support_free_migration_request_click', {
			path: window.location.pathname,
			automated_migration: true,
		} );

		try {
			await sendTicketAsync( {
				locale,
				from_url: fromUrl,
				blog_url: siteSlug,
			} );

			// Reset the site in the state to ensure the correct overview screen is shown.
			siteId && dispatch( resetSite( siteId ) );

			return navigation.submit?.( {
				destination: 'do-it-for-me',
			} );
		} catch ( error ) {
			// TODO: Handle error
		}
	}, [ locale, fromUrl, siteSlug, siteId, dispatch, navigation, sendTicketAsync ] );

	const navigateToDoItForMe = useCallback( () => {
		handleSkip();
	}, [ handleSkip ] );

	const displaySiteName = urlToDomain( fromUrl );
	const hostDisplayName = getSSHHostDisplayName( host );

	const isBusy = isStartingMigration || migrationStarted || shouldStartMigration;

	// Rotating loading messages for continue button
	const { buttonText } = useRotatingLoadingMessages( {
		isBusy,
	} );

	const title = translate( 'Securely share your access' );
	const subtitle = hostDisplayName
		? translate(
				'We use SSH to safely transfer your site from %(hostName)s to WordPress.com. Follow the steps below so we can start migrating {{strong}}%(siteName)s{{/strong}}.',
				{
					args: { hostName: hostDisplayName, siteName: displaySiteName },
					components: { strong: <strong /> },
				}
		  )
		: translate(
				'We use SSH to safely transfer your site to WordPress.com. Follow the steps below so we can start migrating {{strong}}%(siteName)s{{/strong}}.',
				{
					args: { siteName: displaySiteName },
					components: { strong: <strong /> },
				}
		  );
	const topBar = (
		<Step.TopBar
			rightElement={
				<SupportNudge onAskForHelp={ navigateToDoItForMe } isLoading={ isSubmittingTicket } />
			}
		/>
	);

	return (
		<>
			<DocumentHead title={ title } />
			<Step.CenteredColumnLayout
				columnWidth={ 4 }
				topBar={ topBar }
				heading={ <Step.Heading text={ title } subText={ subtitle } /> }
			>
				<SshMigrationContainer>
					<Accordion steps={ steps } />
					<div className="migration-site-ssh__continue-button">
						<Button
							variant="primary"
							onClick={ handleContinue }
							disabled={
								! canStartMigration ||
								isStartingMigration ||
								migrationStarted ||
								shouldStartMigration
							}
							isBusy={ isBusy }
						>
							{ buttonText }
						</Button>
					</div>
				</SshMigrationContainer>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationSshShareAccess;
