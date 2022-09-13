import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const Subscribers: Step = function ( { navigation } ): ReactElement | null {
	const __ = useTranslate();
	const { submit } = navigation;
	const site = useSite();

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
							flowName={ 'onboarding_subscribers' }
							submitBtnName={ __( 'Continue' ) }
							onImportFinished={ handleSubmit }
							allowEmptyFormSubmit={ true }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
							recordTracksEvent={ recordTracksEvent }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
