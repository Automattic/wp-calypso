import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import IntentScreen from './intent-screen';
import type { IntentFlag } from './types';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	queryObject: {
		siteSlug: string;
	};
}

const EXCLUDE_STEPS: { [ key: string ]: string[] } = {
	write: [],
	build: [ 'site-options', 'starting-point' ],
};

const EXTERNAL_FLOW: { [ key: string ]: string } = {
	import: 'importer',
};

export default function IntentStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, stepName, queryObject } = props;
	const headerText = translate( 'Where will you start?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );
	const branchSteps = useBranchSteps( stepName );

	const submitIntent = ( intent: IntentFlag ) => {
		recordTracksEvent( 'calypso_signup_intent_select', { intent } );

		if ( EXTERNAL_FLOW[ intent ] ) {
			page( getStepUrl( EXTERNAL_FLOW[ intent ] ) + '?siteSlug=' + queryObject.siteSlug );
		} else {
			branchSteps( EXCLUDE_STEPS[ intent ] );
			dispatch( submitSignupStep( { stepName }, { intent } ) );
			goToNextStep();
		}
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

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
