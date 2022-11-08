/* eslint-disable wpcalypso/jsx-classname-namespace */
import { IntentScreen, StepContainer } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import startingPointImageUrl from 'calypso/assets/images/onboarding/starting-point.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { preventWidows } from 'calypso/lib/formatting';
import { ONBOARD_STORE } from '../../../../stores';
import useStartingPoints from './starting-points';
import type { Step } from '../../types';

/**
 * The starting point step
 */
const StartingPointStep: Step = function StartingPointStep( { navigation } ) {
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Nice job! Now it’s{{br}}{{/br}} time to get creative.', {
		components: { br: <br /> },
	} );
	const subHeaderText = translate( "Don't worry. You can come back to these steps!" );
	const intents = useStartingPoints();
	const { setStartingPoint } = useDispatch( ONBOARD_STORE );

	const submitIntent = ( startingPoint: string ) => {
		const providedDependencies = { startingPoint };
		recordTracksEvent( 'calypso_signup_starting_point_select', { starting_point: startingPoint } );
		setStartingPoint( startingPoint );
		submit?.( providedDependencies, startingPoint );
	};

	return (
		<StepContainer
			stepName="blogger-starting-point"
			headerImageUrl={ startingPointImageUrl }
			goBack={ goBack }
			skipLabelText={ translate( 'Skip to dashboard' ) }
			goNext={ () => submitIntent( 'skip-to-my-home' ) }
			skipButtonAlign="top"
			isHorizontalLayout={ true }
			formattedHeader={
				<FormattedHeader
					id="intent-header"
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align="left"
				/>
			}
			stepContent={
				<IntentScreen
					intents={ intents }
					intentsAlt={ [] }
					onSelect={ submitIntent }
					preventWidows={ preventWidows }
				/>
			}
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default StartingPointStep;
