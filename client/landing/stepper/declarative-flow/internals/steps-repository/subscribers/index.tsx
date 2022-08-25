import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { ReactElement } from 'react';
import { useSetupOnboardingSite } from 'calypso/landing/stepper/hooks/use-setup-onboarding-site';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const Subscribers: Step = function ( { navigation, flow } ): ReactElement | null {
	const { submit } = navigation;
	const site = useSite();

	useSetupOnboardingSite( { site, flow } );

	const handleSubmit = () => {
		submit?.();
	};

	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName={ 'subscribers' }
			flowName={ 'newsletter' }
			isHorizontalLayout={ false }
			showJetpackPowered={ true }
			stepContent={
				<div className={ 'subscribers' }>
					{ site?.ID && (
						<AddSubscriberForm
							siteId={ site.ID }
							onImportFinished={ handleSubmit }
							showCsvUpload={ false }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
