import { Gridicon, ProgressBar } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { Card, CardBody } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import type { Step as StepType } from '../../types';
import './style.scss';

const SiteMigrationSshInProgress: StepType< {
	submits: {
		action: 'continue';
	};
} > = function () {
	const translate = useTranslate();
	const queryParams = useQuery();
	const fromUrl = queryParams.get( 'from' ) || 'badubatron.com';

	const stepContent = (
		<div className="site-migration-ssh-in-progress">
			<div>
				<ProgressBar value={ 40 } total={ 100 } compact={ true } isPulsing={ false } />
			</div>

			<Card className="site-migration-ssh-in-progress__card">
				<CardBody>
					<h3 className="site-migration-ssh-in-progress__checklist-title">
						{ translate( "Here's what to expect" ) }
					</h3>
					<div className="site-migration-ssh-in-progress__checklist-items">
						<div className="site-migration-ssh-in-progress__checklist-item">
							<Gridicon
								icon="checkmark"
								size={ 24 }
								className="site-migration-ssh-in-progress__icon"
							/>
							<span className="site-migration-ssh-in-progress__checklist-text">
								{ translate( 'Your site stays live for visitors throughout.' ) }
							</span>
						</div>
						<div className="site-migration-ssh-in-progress__checklist-item">
							<Gridicon icon="time" size={ 24 } className="site-migration-ssh-in-progress__icon" />
							<span className="site-migration-ssh-in-progress__checklist-text">
								{ translate( 'Can take up to 30 minutes.' ) }
							</span>
						</div>
						<div className="site-migration-ssh-in-progress__checklist-item">
							<Gridicon icon="mail" size={ 24 } className="site-migration-ssh-in-progress__icon" />
							<span className="site-migration-ssh-in-progress__checklist-text">
								{ translate( "We'll email you when your new site is ready to explore." ) }
							</span>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);

	const pageTitle = translate( 'Your migration is underway' );
	const pageSubTitle = translate(
		"We're carefully making a copy of %(fromUrl)s on WordPress.com.",
		{
			args: { fromUrl },
		}
	);

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
