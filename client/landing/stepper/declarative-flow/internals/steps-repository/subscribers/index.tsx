import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { useIsEligibleSubscriberImporter } from 'calypso/landing/stepper/hooks/use-is-eligible-subscriber-importer';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';

const Subscribers: Step = function ( { navigation } ) {
	const __ = useTranslate();
	const { submit } = navigation;
	const site = useSite();
	const isUserEligibleForSubscriberImporter = useIsEligibleSubscriberImporter();

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
							manualListEmailInviting={ ! isUserEligibleForSubscriberImporter }
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
