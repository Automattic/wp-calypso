import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSetupOnboardingSite } from 'calypso/landing/stepper/hooks/use-setup-onboarding-site';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const Subscribers: Step = function ( { navigation, flow } ): ReactElement | null {
	const __ = useTranslate();
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
							submitBtnName={ __( 'Continue' ) }
							onImportFinished={ handleSubmit }
							allowEmptyFormSubmit={ true }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
