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

	const submitButtonText = isImportValid
		? translate( 'Add and continue' )
		: translate( 'Continue' );

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
							isSiteOnFreePlan={ !! site?.plan?.is_free }
							flowName="onboarding_subscribers"
							submitBtnName={ submitButtonText }
							onImportFinished={ handleSubmit }
							onChangeIsImportValid={ ( isValid ) => setIsImportValid( isValid ) }
							allowEmptyFormSubmit={ true }
							manualListEmailInviting={ ! isUserEligibleForSubscriberImporter }
							showCsvUpload={ isEnabled( 'subscriber-csv-upload' ) }
							recordTracksEvent={ recordTracksEvent }
							titleText={ translate( 'Ready to add your first subscribers?' ) }
							subtitleText={ translate(
								'Add your first subscribers — or import 100 for free — to start spreading the news.'
							) }
							showSubtitle={ true }
							emailPlaceholders={ [
								translate( 'sue@email.com' ),
								translate( 'thomaswhigginson@email.com' ),
								translate( 'ed.dickinson@email.com' ),
							] }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
