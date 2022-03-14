import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import startingPointImageUrl from 'calypso/assets/images/onboarding/starting-point.svg';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import {
	resetSocialProfiles,
	updateSocialProfiles,
} from 'calypso/state/signup/steps/social-profiles/actions';
import { getSocialProfiles } from 'calypso/state/signup/steps/social-profiles/selectors';
import SocialProfiles from './social-profiles';
import type { SocialProfilesState } from 'calypso/state/signup/steps/social-profiles/schema';

import './style.scss';

interface Props {
	goToNextStep: () => void;
	submitSignupStep: ( { stepName, wasSkipped }: { stepName: string; wasSkipped: boolean } ) => void;
	goToStep: ( stepName: string ) => void;
	stepName: string;
}

export default function SocialProfilesStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const headerText = translate( 'Do you have social media profiles?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );

	useEffect( () => {
		dispatch( saveSignupStep( { stepName: props.stepName } ) );
	}, [ dispatch, props.stepName ] );

	const initialSocialProfiles = useSelector( getSocialProfiles );

	const submitSignupStepAndProceed = () => {
		dispatch( submitSignupStep( { stepName: props.stepName } ) );
		props.goToNextStep();
	};

	const onSubmit = ( socialProfiles: SocialProfilesState ) => {
		dispatch( updateSocialProfiles( socialProfiles ) );
		submitSignupStepAndProceed();
	};

	const onSkip = () => {
		dispatch( resetSocialProfiles() );
		submitSignupStepAndProceed();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<SocialProfiles
					initialSocialProfiles={ initialSocialProfiles }
					onSubmit={ onSubmit }
					onSkip={ onSkip }
				/>
			}
			align={ 'left' }
			hideSkip
			isHorizontalLayout={ true }
			isWideLayout={ true }
			headerImageUrl={ startingPointImageUrl }
			{ ...props }
		/>
	);
}
