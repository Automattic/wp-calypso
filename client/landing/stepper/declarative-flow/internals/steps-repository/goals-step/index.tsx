/* eslint-disable wpcalypso/jsx-classname-namespace */
import { isEnabled } from '@automattic/calypso-config';
//import { IntentScreen, StepContainer } from '@automattic/onboarding';
import { StepContainer } from '@automattic/onboarding';
//import { useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
//import { preventWidows } from 'calypso/lib/formatting';
//import { useSite } from '../../../../hooks/use-site';
//import { ONBOARD_STORE } from '../../../../stores';
//import { useIntents, useIntentsAlt } from './intents';
import type { Step } from '../../types';

import './style.scss';

/**
 * The intent capture step
 */
const GoalsStep: Step = function GoalsStep( { navigation } ) {
	//const { goBack, goNext, submit } = navigation;
	const { goBack, goNext } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'What are your goals?' );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	//const { setIntent } = useDispatch( ONBOARD_STORE );

	// example usage
	// const site = useSite();
	// const hasSimplePayments = useSelect(
	//	( select ) => site && select( SITE_STORE ).hasActiveSiteFeature( site?.ID, 'simple-payments' )
	//);

	//const intents = useIntents();
	//const site = useSite();
	//const canImport = Boolean( site?.capabilities.manage_options );
	//const intentsAlt = useIntentsAlt( canImport );

	/*
	const submitIntent = ( intent: string ) => {
		const providedDependencies = { intent };
		recordTracksEvent( 'calypso_signup_intent_select', providedDependencies );
		setIntent( intent );
		submit?.( providedDependencies, intent );
	};
    */

	return (
		<StepContainer
			stepName={ 'goals-step' }
			goBack={ goBack }
			goNext={ goNext }
			skipLabelText={ translate( 'Skip to Dashboard' ) }
			skipButtonAlign={ 'top' }
			hideBack={ ! isEnabled( 'signup/site-vertical-step' ) }
			isHorizontalLayout={ false }
			formattedHeader={
				<FormattedHeader
					id={ 'intent-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					align={ 'center' }
				/>
			}
			stepContent={ <p>stepContent goes here</p> }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GoalsStep;
