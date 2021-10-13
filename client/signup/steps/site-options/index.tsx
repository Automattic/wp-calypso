import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import siteOptionsImage from 'calypso/assets/images/onboarding/site-options.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SiteOptions from './site-options';
import type { SiteOptionsFormValues } from './types';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
}

export default function SiteOptionsStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const headerText = translate( "First, let's give your blog a name" );
	const { stepName, signupDependencies, goToNextStep } = props;
	const { siteTitle, tagline } = signupDependencies;
	const submitSiteOptions = ( { siteTitle, tagline }: SiteOptionsFormValues ) => {
		recordTracksEvent( 'calypso_signup_submit_site_options', { siteTitle, tagline } );
		dispatch( submitSignupStep( { stepName }, { siteTitle, tagline } ) );
		goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ '' }
			fallbackSubHeaderText={ '' }
			headerImageUrl={ siteOptionsImage }
			stepContent={
				<SiteOptions
					defaultSiteTitle={ siteTitle }
					defaultTagline={ tagline }
					onSubmit={ submitSiteOptions }
				/>
			}
			align={ 'left' }
			skipButtonAlign={ 'top' }
			isHorizontalLayout={ true }
			{ ...props }
		/>
	);
}
