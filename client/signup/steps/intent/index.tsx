import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useBranchSteps from 'calypso/signup/hooks/use-branch-steps';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import IntentScreen from './intent-screen';
import type { IntentFlag } from './types';
import type { Dependencies } from 'calypso/signup/types';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	queryObject: {
		siteSlug?: string;
		siteId?: string;
	};
}

export const EXCLUDED_STEPS: { [ key: string ]: string[] } = {
	write: [ 'store-options', 'store-features' ],
	build: [ 'site-options', 'starting-point', 'courses', 'store-options', 'store-features' ],
	sell: [ 'site-options', 'starting-point', 'courses', 'design-setup-site' ],
};

const EXTERNAL_FLOW: { [ key: string ]: string } = {
	import: 'importer',
};

const getExcludedSteps = ( providedDependencies?: Dependencies ) =>
	EXCLUDED_STEPS[ providedDependencies?.intent ];

export default function IntentStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { goToNextStep, stepName, queryObject } = props;
	const headerText = translate( 'Where will you start?' );
	const subHeaderText = translate( 'You can change your mind at any time.' );
	const branchSteps = useBranchSteps( stepName, getExcludedSteps );

	const siteId = useSelector( ( state ) => getSiteId( state, queryObject.siteSlug as string ) );
	const canImport = useSelector( ( state ) =>
		canCurrentUser( state, siteId as number, 'manage_options' )
	);

	const submitIntent = ( intent: IntentFlag ) => {
		const providedDependencies = { intent };

		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );

		if ( EXTERNAL_FLOW[ intent ] ) {
			dispatch( submitSignupStep( { stepName }, providedDependencies ) );
			page( getStepUrl( EXTERNAL_FLOW[ intent ], '', '', '', queryObject ) );
		} else {
			branchSteps( providedDependencies );
			dispatch( submitSignupStep( { stepName }, providedDependencies ) );
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
			stepContent={ <IntentScreen canImport={ canImport } onSelect={ submitIntent } /> }
			align={ 'left' }
			hideSkip
			isHorizontalLayout={ true }
			siteId={ siteId }
			{ ...props }
		/>
	);
}
