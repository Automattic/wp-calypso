import { isEnabled } from '@automattic/calypso-config';
import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useIsEligibleSubscriberImporter } from 'calypso/landing/stepper/hooks/use-is-eligible-subscriber-importer';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import './style.scss';

const Subscribers: Step = function ( { navigation } ) {
	const [ isImportValid, setIsImportValid ] = useState( false );
	const translate = useTranslate();
	const { submit } = navigation;
	const site = useSite();
	const isUserEligibleForSubscriberImporter = useIsEligibleSubscriberImporter();

	const handleSubmit = () => {
		submit?.();
	};

	const isSiteOnFreePlan = !! site?.plan?.is_free;

	const subtitleText = isSiteOnFreePlan
		? translate(
				'Bring up to 100 subscribers for free — or add some individually — to start spreading the news.'
		  )
		: translate(
				'Bring your subscribers with you — or add some individually — to start spreading the news.'
		  );

	const submitButtonText = isImportValid
		? translate( 'Add and continue' )
		: translate( 'Skip for now' );

	return (
		<StepContainer
			shouldHideNavButtons={ true }
			hideFormattedHeader={ true }
			stepName="subscribers"
			flowName="newsletter"
			isHorizontalLayout={ false }
			showJetpackPowered={ true }
			stepContent={
				<div className="subscribers">
					{ site?.ID && (
						<AddSubscriberForm
							siteId={ site.ID }
							isSiteOnFreePlan={ isSiteOnFreePlan }
							flowName="onboarding_subscribers"
							submitBtnName={ submitButtonText }
							onImportFinished={ handleSubmit }
							onChangeIsImportValid={ ( isValid ) => setIsImportValid( isValid ) }
							allowEmptyFormSubmit={ true }
							manualListEmailInviting={ ! isUserEligibleForSubscriberImporter }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
							recordTracksEvent={ recordTracksEvent }
							titleText={ translate( 'Ready to add your first subscribers?' ) }
							subtitleText={ subtitleText }
							showSubtitle={ true }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
