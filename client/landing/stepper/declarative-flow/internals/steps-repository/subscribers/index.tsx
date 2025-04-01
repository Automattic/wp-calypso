import { FEATURE_UNLIMITED_SUBSCRIBERS } from '@automattic/calypso-products';
import { StepContainer } from '@automattic/onboarding';
import { AddSubscriberForm } from '@automattic/subscriber';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useIsEligibleSubscriberImporter } from 'calypso/landing/stepper/hooks/use-is-eligible-subscriber-importer';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { Step } from '../../types';
import type { AppState } from 'calypso/types';
import './style.scss';

const Subscribers: Step = function ( { navigation } ) {
	const [ isImportValid, setIsImportValid ] = useState( false );
	const translate = useTranslate();
	const { submit } = navigation;
	const site = useSite();
	const isUserEligibleForSubscriberImporter = useIsEligibleSubscriberImporter();
	const hasUnlimitedSubscribers = useSelector( ( state: AppState ) =>
		siteHasFeature( state, site?.ID, FEATURE_UNLIMITED_SUBSCRIBERS )
	);

	const handleSubmit = () => {
		submit?.();
	};

	const hasSubscriberLimit = ! hasUnlimitedSubscribers && !! site?.plan?.is_free;

	const subtitleText = hasSubscriberLimit
		? translate(
				'Bring up to 100 subscribers for free — or add some individually — to start spreading the news.'
		  )
		: translate(
				'Bring your subscribers with you — or add some individually — to start spreading the news.'
		  );

	const submitButtonText = isImportValid
		? translate( 'Add and continue' )
		: translate( 'Add subscribers' );

	return (
		<StepContainer
			shouldHideNavButtons
			hideFormattedHeader
			stepName="subscribers"
			flowName="newsletter"
			isHorizontalLayout={ false }
			stepContent={
				<div className="subscribers">
					{ site?.ID && (
						<AddSubscriberForm
							siteId={ site.ID }
							hasSubscriberLimit={ hasSubscriberLimit }
							flowName="onboarding_subscribers"
							submitBtnName={ submitButtonText }
							onImportFinished={ handleSubmit }
							onSkipBtnClick={ handleSubmit }
							onChangeIsImportValid={ ( isValid ) => setIsImportValid( isValid ) }
							allowEmptyFormSubmit={ false }
							manualListEmailInviting={ ! isUserEligibleForSubscriberImporter }
							showCsvUpload
							recordTracksEvent={ recordTracksEvent }
							titleText={ translate( 'Ready to add your first subscribers?' ) }
							subtitleText={ subtitleText }
							showSubtitle
							showSkipLink
							submitBtnAlwaysEnable={ false }
						/>
					) }
				</div>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default Subscribers;
