import { Gridicon, ProgressBar } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
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
		action: 'continue';
	};
} > = function () {
	const translate = useTranslate();
	const queryParams = useQuery();
	const fromUrl = queryParams.get( 'from' ) ?? null;

	const stepContent = (
		<div className="site-migration-ssh-in-progress">
			<div className="site-migration-ssh-in-progress__progress">
				<ProgressBar value={ 40 } total={ 100 } compact isPulsing={ false } />
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

	// Clean the URL for display: remove protocol and trailing slashes
	const cleanUrl = fromUrl ? fromUrl.replace( /^https?:\/\//, '' ).replace( /\/+$/, '' ) : '';

	const pageTitle = translate( 'Your migration is underway' );
	const pageSubTitle = fromUrl
		? translate(
				"We're carefully making a copy of {{strong}}%(cleanUrl)s{{/strong}} on WordPress.com.",
				{
					args: { cleanUrl },
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
