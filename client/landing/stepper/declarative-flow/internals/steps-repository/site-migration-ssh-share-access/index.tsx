import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useCallback, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { urlToDomain } from 'calypso/lib/url';
import { SupportNudge } from '../site-migration-instructions/support-nudge';
import { Accordion } from './components/accordion';
import { SshMigrationContainer } from './components/ssh-migration-container';
import { getSSHHostDisplayName } from './steps/ssh-host-support-urls';
import { useSteps } from './steps/use-steps';
import type { Step as StepType } from '../../types';

import './styles.scss';

const SiteMigrationSshShareAccess: StepType< {
	submits: {
		destination?: 'migration-started' | 'no-ssh-access' | 'back-to-verification';
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

	// Redirect back to verification step if transferId is missing
	useEffect( () => {
		if ( ! transferId ) {
			navigation.submit?.( { destination: 'back-to-verification' } );
		}
	}, [ transferId, navigation ] );

	const handleNoSSHAccess = useCallback( () => {
		navigation.submit?.( { destination: 'no-ssh-access' } );
	}, [ navigation ] );

	// Steps orchestration
	const onCompleteSteps = () => {
		navigation.submit?.( { destination: 'migration-started' } );
	};

	const { steps } = useSteps( {
		fromUrl,
		siteId,
		siteName: site?.name ?? '',
		onComplete: onCompleteSteps,
		host,
		onNoSSHAccess: handleNoSSHAccess,
	} );

	const handleContinue = () => {
		navigation.submit?.( { destination: 'migration-started' } );
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
							disabled={ false }
							isBusy={ false }
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
