import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SellDetails from './sell-details';
import type { SellDetailsFormValues } from './types';
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
	const headerText = translate( "First, let's give your store a name" );
	const { stepName, signupDependencies, goToNextStep } = props;
	const { siteTitle, tagline } = signupDependencies;

	const submitSiteOptions = ( { storeName, tagline }: SellDetailsFormValues ) => {
		recordTracksEvent( 'calypso_signup_sell_details_submit', {
			has_store_name: !! storeName,
			has_tagline: !! tagline,
		} );
		dispatch( submitSignupStep( { stepName }, { storeName, tagline } ) );
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
			headerImageUrl={ intentImageUrl }
			stepContent={
				<SellDetails
					defaultSiteTitle={ siteTitle }
					defaultTagline={ tagline }
					onSubmit={ submitSiteOptions }
				/>
			}
			align={ 'left' }
			skipButtonAlign={ 'top' }
			skipLabelText={ translate( 'Skip this step' ) }
			isHorizontalLayout={ true }
			defaultDependencies={ {
				storeName: '',
				tagline: '',
			} }
			{ ...props }
		/>
	);
}
