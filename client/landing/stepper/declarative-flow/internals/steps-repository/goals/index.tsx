import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SelectGoals from './select-goals';
import type { Step } from '../../types';
import './style.scss';

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const { goNext } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Welcome! What are your goals?' );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const { setGoals } = useDispatch( ONBOARD_STORE );
	const stepContent = (
		<SelectGoals
			selectedGoals={ goals }
			onChange={ setGoals }
			onSubmit={ () => {
				navigation.submit?.( { intent } );
			} }
		/>
	);

	return (
		<StepContainer
			stepName={ 'goals-step' }
			goNext={ goNext }
			skipLabelText={ translate( 'Skip to Dashboard' ) }
			skipButtonAlign={ 'top' }
			hideBack={ true }
			isHorizontalLayout={ false }
			className={ 'goals__container' }
			formattedHeader={
				<FormattedHeader
					id={ 'goals-header' }
					headerText={ headerText }
					subHeaderText={ subHeaderText }
				/>
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
		/>
	);
};

export default GoalsStep;
