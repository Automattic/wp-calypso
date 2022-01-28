import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import startingPointImageUrl from 'calypso/assets/images/onboarding/starting-point.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import StartingPoint from './starting-point';
import type { StartingPointFlag } from './types';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

const EXCLUDE_STEPS: { [ key: string ]: string[] } = {
	write: [ 'courses', 'design-setup-site' ],
	courses: [ 'design-setup-site' ],
	design: [ 'courses' ],
	'skip-to-my-home': [ 'courses', 'design-setup-site' ],
};

const getExcludeSteps = ( values: any ) => EXCLUDE_STEPS[ values?.startingPoint ];

export default function StartingPointStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, stepName } = props;
	const headerText = translate( 'Nice job! Now it’s{{br}}{{/br}} time to get creative.', {
		components: { br: <br /> },
	} );
	const subHeaderText = translate( "Don't worry. You can come back to these steps!" );
	const branchSteps = useBranchSteps( stepName, getExcludeSteps );

	const submitStartingPoint = ( startingPoint: StartingPointFlag ) => {
		const values = { startingPoint };
		branchSteps( values );
		recordTracksEvent( 'calypso_signup_starting_point_select', { starting_point: startingPoint } );
		dispatch( submitSignupStep( { stepName }, values ) );
		goToNextStep();
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<StepWrapper
			{ ...props }
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			headerImageUrl={ startingPointImageUrl }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			stepContent={ <StartingPoint onSelect={ submitStartingPoint } /> }
			align={ 'left' }
			skipButtonAlign={ 'top' }
			skipLabelText={ translate( 'Skip to My Home' ) }
			// We need to redirect user to My Home and apply the default theme if the user skips this step
			goToNextStep={ () => submitStartingPoint( 'skip-to-my-home' ) }
			isHorizontalLayout={ true }
		/>
	);
}
