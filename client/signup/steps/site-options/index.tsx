import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import siteOptionsImage from 'calypso/assets/images/onboarding/site-options.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SiteOptions from './site-options';
import type { SiteOptionsFormValues } from './types';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

export default function SiteOptionsStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, signupDependencies, goToNextStep } = props;
	const { siteTitle, tagline } = signupDependencies;

	const headerText =
		'store-options' === stepName
			? translate( "First, let's give your store a name" )
			: translate( "First, let's give your blog a name" );

	const headerImage = 'store-options' === stepName ? intentImageUrl : siteOptionsImage;

	const siteTitleLabel =
		'store-options' === stepName ? translate( 'Store name' ) : translate( 'Blog name' );

	const taglineExplanation =
		'store-options' === stepName
			? translate( 'In a few words, explain what your store is about.' )
			: translate( 'In a few words, explain what your blog is about.' );

	const submitSiteOptions = ( { siteTitle, tagline }: SiteOptionsFormValues ) => {
		recordTracksEvent( 'calypso_signup_site_options_submit', {
			has_site_title: !! siteTitle,
			has_tagline: !! tagline,
		} );
		dispatch( submitSignupStep( { stepName }, { siteTitle, tagline } ) );
		goToNextStep();
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ '' }
			fallbackSubHeaderText={ '' }
			headerImageUrl={ headerImage }
			stepContent={
				<SiteOptions
					defaultSiteTitle={ siteTitle }
					defaultTagline={ tagline }
					siteTitleLabel={ siteTitleLabel }
					taglineExplanation={ taglineExplanation }
					onSubmit={ submitSiteOptions }
				/>
			}
			align={ 'left' }
			skipButtonAlign={ 'top' }
			skipLabelText={ translate( 'Skip this step' ) }
			isHorizontalLayout={ true }
			defaultDependencies={ {
				siteTitle: '',
				tagline: '',
			} }
			{ ...props }
		/>
	);
}
