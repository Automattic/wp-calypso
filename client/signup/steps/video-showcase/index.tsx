import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import siteOptionsImage from 'calypso/assets/images/onboarding/site-options.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import VideoShowcase from './video-showcase';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
}

export default function VideoShowcaseStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const headerText = translate( 'Watch five videos.' );
	const subHeaderText = translate( 'Save yourself hours.' );
	const skipLabelText = translate( 'Draft your first post' );
	const { stepName, signupDependencies, goToNextStep } = props;
	const { siteTitle, tagline } = signupDependencies;
	//const submitSiteOptions = ( { siteTitle, tagline }: SiteOptionsFormValues ) => {
	const submitSiteOptions = () => {
		//recordTracksEvent( 'calypso_signup_submit_site_options', { siteTitle, tagline } );
		//dispatch( submitSignupStep( { stepName }, { siteTitle, tagline } ) );
		goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ '' }
			hideFormattedHeader={ true }
			stepContent={ <VideoShowcase /> }
			align={ 'left' }
			skipLabelText={ skipLabelText }
			skipButtonAlign={ 'top' }
			isHorizontalLayout={ true }
			{ ...props }
		/>
	);
}
