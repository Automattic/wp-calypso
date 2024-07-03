import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import startingPointImageUrl from 'calypso/assets/images/onboarding/starting-point.svg';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch } from 'calypso/state';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SocialProfiles from './social-profiles';
import type { SocialProfilesState } from './types';

import './style.scss';

interface Props {
	goToNextStep: () => void;
	stepName: string;
	flowName: string;
	signupDependencies: SocialProfilesState;
}

export default function SocialProfilesStep( props: Props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, signupDependencies, flowName, goToNextStep } = props;

	const headerText = translate( 'Do you have social media profiles?' );
	const subHeaderText = translate( 'You can always add them later.' );

	useEffect( () => {
		triggerGuidesForStep( flowName, stepName );
		dispatch( saveSignupStep( { stepName: stepName } ) );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const { twitterUrl, facebookUrl, linkedinUrl, instagramUrl } = signupDependencies;

	const onSubmit = ( socialProfiles: SocialProfilesState ) => {
		dispatch(
			submitSignupStep(
				{ stepName: stepName },
				{
					twitterUrl: socialProfiles.twitterUrl,
					facebookUrl: socialProfiles.facebookUrl,
					linkedinUrl: socialProfiles.linkedinUrl,
					instagramUrl: socialProfiles.instagramUrl,
				}
			)
		);
		goToNextStep();
	};

	const onSkip = () => {
		dispatch(
			submitSignupStep(
				{ stepName: stepName },
				{
					twitterUrl: '',
					facebookUrl: '',
					linkedinUrl: '',
					instagramUrl: '',
				}
			)
		);
		goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={
				<SocialProfiles
					defaultTwitterUrl={ twitterUrl }
					defaultFacebookUrl={ facebookUrl }
					defaultLinkedinUrl={ linkedinUrl }
					defaultInstagramUrl={ instagramUrl }
					onSubmit={ onSubmit }
					onSkip={ onSkip }
				/>
			}
			align="left"
			hideSkip
			isHorizontalLayout
			isWideLayout
			headerImageUrl={ startingPointImageUrl }
			{ ...props }
		/>
	);
}
