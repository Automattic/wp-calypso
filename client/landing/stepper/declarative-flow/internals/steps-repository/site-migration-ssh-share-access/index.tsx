import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect, useState } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { urlToDomain } from 'calypso/lib/url';
import { useDispatch } from 'calypso/state';
import { resetSite } from 'calypso/state/sites/actions';
import { SupportNudge } from '../site-migration-instructions/support-nudge';
import { useSSHMigrationStatus } from '../site-migration-ssh-in-progress/hooks/use-ssh-migration-status';
import { Accordion } from './components/accordion';
import { SshMigrationContainer } from './components/ssh-migration-container';
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
			| 'back-to-verification';
		how?: ( typeof HOW_TO_MIGRATE_OPTIONS )[ 'DO_IT_FOR_ME' ];
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

	const { steps, formState, canStartMigration, onMigrationStarted, setMigrationError } = useSteps( {
		fromUrl,
		siteId,
		siteName: site?.name ?? '',
		host,
		onNoSSHAccess: handleNoSSHAccess,
	} );

	const { mutate: startMigration, isPending: isStartingMigration } = useStartSSHMigration();

	// Poll for migration status after starting migration
	const { data: migrationStatus } = useSSHMigrationStatus( {
		siteId,
		enabled: migrationStarted && siteId > 0,
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

	const handleContinue = () => {
		setMigrationError( null );
		startMigration(
			{
				siteId,
				remoteHost: formState.serverAddress,
				remoteUser: formState.username,
				remoteDomain: fromUrl,
				remotePass: formState.password,
			},
			{
				onSuccess: () => {
					onMigrationStarted();
					setMigrationStarted( true );
				},
				onError: ( error ) => {
					setMigrationError( error );
				},
			}
		);
	};

	const navigateToDoItForMe = useCallback( () => {
		navigation.submit?.( { how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME } );
	}, [ navigation ] );

	const displaySiteName = urlToDomain( fromUrl );
	const hostDisplayName = getSSHHostDisplayName( host );

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
		<Step.TopBar rightElement={ <SupportNudge onAskForHelp={ navigateToDoItForMe } /> } />
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
							disabled={ ! canStartMigration || isStartingMigration || migrationStarted }
							isBusy={ isStartingMigration || migrationStarted }
						>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</SshMigrationContainer>
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationSshShareAccess;
