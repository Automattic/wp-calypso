import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import flows from 'calypso/signup/config/flows';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import IntentScreen from './intent-screen';
import type { IntentFlag } from './types';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
}

const EXCLUDE_STEPS: { [ key: string ]: string[] } = {
	write: [ 'design-setup-site' ],
	build: [ 'site-options' ],
};

export default function IntentStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, stepName } = props;
	const headerText = translate( 'Where will you start?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );

	const submitIntent = ( intent: IntentFlag ) => {
		// TODO: Better way to handle branch steps
		// We need to exclude these steps before submitSignupStep because we process steps
		// after submitting and check the current steps at that time
		EXCLUDE_STEPS[ intent ]?.forEach( ( step ) => {
			flows.excludeStep( step );
		} );

		recordTracksEvent( 'calypso_signup_select_intent', { intent } );
		dispatch( submitSignupStep( { stepName }, { intent } ) );
		goToNextStep();
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
		// User might go back to intent step, so we should reset excluded steps
		flows.resetExcludedSteps();
	}, [] );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			headerImageUrl={ intentImageUrl }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <IntentScreen onSelect={ submitIntent } /> }
			align={ 'left' }
			hideSkip
			isHorizontalLayout={ true }
			{ ...props }
		/>
	);
}
