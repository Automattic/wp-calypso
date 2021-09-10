import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import IntentScreen from './intent-screen';
import type { IntentFlag } from './types';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
}

export default function IntentStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, stepName } = props;

	const headerText = translate( 'Where will you start?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );

	const submitIntent = ( intent: IntentFlag ) => {
		recordTracksEvent( 'calypso_signup_select_intent', { intent } );

		dispatch( submitSignupStep( { stepName }, { intent } ) );

		if ( intent === 'write' ) {
			dispatch(
				submitSignupStep(
					{ stepName: 'design-setup-site' },
					{
						selectedDesign: {
							theme: 'independent-publisher-2',
							slug: 'independent-publisher-2',
						},
					}
				)
			);
		}

		goToNextStep();
	};

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <IntentScreen onSelect={ submitIntent } /> }
			align={ 'left' }
			hideSkip
			{ ...props }
		/>
	);
}
