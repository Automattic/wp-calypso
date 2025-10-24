import { Gridicon } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { Card, CardBody, ProgressBar } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { urlToDomain } from 'calypso/lib/url';
import { useSSHMigrationStatus } from './hooks/use-ssh-migration-status';
import type { Step as StepType } from '../../types';
import './style.scss';

type SiteMigrationSshInProgressChecklistItem = {
	icon: string;
	text: string;
};

const SiteMigrationSshInProgressChecklist = ( {
	items,
}: {
	items: SiteMigrationSshInProgressChecklistItem[];
} ) => {
	return (
		<div className="site-migration-ssh-in-progress__checklist-items">
			{ items.map( ( item, index ) => (
				<div key={ index } className="site-migration-ssh-in-progress__checklist-item">
					<div className="site-migration-ssh-in-progress__checklist-item-icon">
						<Gridicon
							icon={ item.icon }
							size={ 16 }
							className="site-migration-ssh-in-progress__icon"
						/>
					</div>
					<div className="site-migration-ssh-in-progress__checklist-item-text">{ item.text }</div>
				</div>
			) ) }
		</div>
	);
};

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

	const stepContent = (
		<div className="site-migration-ssh-in-progress">
			<div className="site-migration-ssh-in-progress__progress">
				<ProgressBar className="site-migration-ssh-in-progress__progress-container" />
			</div>

			<Card className="site-migration-ssh-in-progress__card">
				<CardBody>
					<div className="site-migration-ssh-in-progress__checklist-title">
						{ translate( "Here's what to expect" ) }
					</div>
					<SiteMigrationSshInProgressChecklist
						items={ [
							{
								icon: 'checkmark',
								text: translate( 'Your site stays live for visitors throughout.' ),
							},
							{ icon: 'time', text: translate( 'Can take up to 30 minutes.' ) },
							{
								icon: 'mail',
								text: translate( "We'll email you when your new site is ready to explore." ),
							},
						] }
					/>
				</CardBody>
			</Card>
		</div>
	);

	const siteDomain = fromUrl ? urlToDomain( fromUrl ) : '';

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
