import IntentScreen from '@automattic/intent-screen';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { useIntents, useIntentsAlt } from './intents';
import type { StepPath } from '../';
import type { Step } from '../../types';

/**
 * The intent capture step
 */
const IntentStep: Step = function IntentStep( { navigation } ) {
	const { goToPage } = navigation;

	// const siteId = useSelector( ( state ) => getSiteId( state ) );
	// const canImport = useSelector( ( state ) =>
	// 	canCurrentUser( state, siteId as number, 'manage_options' )
	// );

	const intents = useIntents();
	// I need to get the site slug to get the siteId to get the canImport
	const intentsAlt = useIntentsAlt( true );

	const submitIntent = ( intent: StepPath ) => {
		const providedDependencies = { intent };
		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );

		goToPage( intent );
		// // if ( EXTERNAL_FLOW[ intent ] ) {
		// // 	dispatch( submitSignupStep( { stepName }, providedDependencies ) );
		// // 	page( getStepUrl( EXTERNAL_FLOW[ intent ], '', '', '', queryObject ) );
		// // } else {
		// // 	branchSteps( providedDependencies );
		// // 	dispatch( submitSignupStep( { stepName }, providedDependencies ) );
		// // 	goToNextStep();
		// // }
	};

	return (
		<div>
			<h1>Intent step</h1>
			<IntentScreen
				intents={ intents }
				intentsAlt={ intentsAlt }
				onSelect={ submitIntent }
				preventWidows={ preventWidows }
			/>
		</div>
	);
};

export default IntentStep;
