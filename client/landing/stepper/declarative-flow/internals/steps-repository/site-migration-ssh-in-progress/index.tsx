import { Step } from '@automattic/onboarding';
import { ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import ExpectationChecklist from 'calypso/components/expectation-checklist';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { urlToDomain } from 'calypso/lib/url';
import { useSSHMigrationStatus } from './hooks/use-ssh-migration-status';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationSshInProgress: StepType< {
	submits: {
		action: 'migration-completed' | 'migration-failed' | 'preflight' | 'unexpected-status';
	};
} > = function ( { navigation } ) {
	const translate = useTranslate();
	const site = useSite();
	const siteId = site?.ID ?? 0;
	const queryParams = useQuery();
	const fromUrl = queryParams.get( 'from' ) ?? null;

	const { data: migrationStatus } = useSSHMigrationStatus( {
		siteId,
		enabled: siteId > 0,
	} );

	useEffect( () => {
		if ( ! migrationStatus ) {
			return;
		}

		// Handle different migration statuses
		switch ( migrationStatus.status ) {
			case 'completed':
				navigation.submit?.( { action: 'migration-completed' } );
				break;
			case 'failed':
				// We should only consider a migration failed when the step
				// is related to the migration. This is because we can get the failed
				// status when the preflight check fails. Which should not be
				// responsibility of this step.
				if ( ! [ 'migration-starting', 'migration-running' ].includes( migrationStatus.step ) ) {
					navigation.submit?.( { action: 'unexpected-status' } );
					break;
				}
				navigation.submit?.( { action: 'migration-failed' } );
				break;
			case 'migrating':
				// This means that the migration is still in progress.
				break;
			default:
				// Any other statuses should be considered as unexpected.
				navigation.submit?.( { action: 'unexpected-status' } );
				break;
		}
	}, [ migrationStatus, navigation ] );

	const siteDomain = fromUrl ? urlToDomain( fromUrl ) : '';

	const stepContent = (
		<div className="site-migration-ssh-in-progress">
			<div className="site-migration-ssh-in-progress__progress">
				<ProgressBar className="site-migration-ssh-in-progress__progress-container" />
			</div>

			<ExpectationChecklist
				title={ translate( "Here's what to expect" ) }
				items={ [
					{
						icon: 'checkmark',
						text: translate(
							'{{strong}}%(siteDomain)s{{/strong}} will still be accessible without\u00A0interruptions.',
							{
								args: { siteDomain },
								components: { strong: <strong /> },
							}
						),
					},
					{
						icon: 'time',
						text: translate( 'Migrations can take up to 30 minutes to complete.' ),
					},
					{
						icon: 'mail',
						text: translate(
							"You can safely navigate away. We'll email you when your new site is ready to explore."
						),
					},
				] }
			/>
		</div>
	);

	const pageTitle = translate( 'Your migration is underway' );
	const pageSubTitle = fromUrl
		? translate(
				"We're carefully making a copy of {{strong}}%(siteDomain)s{{/strong}} on WordPress.com.",
				{
					args: { siteDomain },
					components: { strong: <strong /> },
				}
		  )
		: null;

	return (
		<>
			<DocumentHead title={ pageTitle } />
			<Step.CenteredColumnLayout
				columnWidth={ 5 }
				topBar={ <Step.TopBar /> }
				heading={ <Step.Heading text={ pageTitle } subText={ pageSubTitle } /> }
			>
				{ stepContent }
			</Step.CenteredColumnLayout>
		</>
	);
};

export default SiteMigrationSshInProgress;
