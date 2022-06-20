import { Onboard } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import SelectGoals from './select-goals';
import type { Step } from '../../types';
import './style.scss';

type TracksGoalsSelectEventProperties = {
	goals: string;
	write?: number;
	promote?: number;
	sell?: number;
	difm?: number;
	import?: number;
	other?: number;
	ref?: string;
	intent: string;
};

const SiteGoal = Onboard.SiteGoal;
const { serializeGoals, goalsToIntent } = Onboard.utils;

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const { goNext } = navigation;
	const translate = useTranslate();
	const headerText = translate( 'Welcome! What are your goals?' );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
	const { setGoals, setIntent, clearImportGoal } = useDispatch( ONBOARD_STORE );

	useEffect( () => {
		clearImportGoal();
	}, [ clearImportGoal ] );

	const handleChange = ( goals: Onboard.SiteGoal[] ) => {
		const intent = goalsToIntent( goals );
		setIntent( intent );
		setGoals( goals );
		return intent;
	};

	const recordGoalsSelectTracksEvent = (
		goals: Onboard.SiteGoal[],
		intent: Onboard.SiteIntent
	) => {
		const eventProperties: TracksGoalsSelectEventProperties = {
			goals: serializeGoals( goals ),
			intent,
		};

		goals.forEach( ( goal, i ) => {
			eventProperties[ goal ] = i + 1;
		} );

		// TODO: Add ref prop in another PR.

		recordTracksEvent( 'calypso_signup_goals_select', eventProperties );
	};

	const recordIntentSelectTracksEvent = (
		submittedGoals: Onboard.SiteGoal[],
		intent: Onboard.SiteIntent
	) => {
		const hasImportGoal = submittedGoals.includes( SiteGoal.Import );

		const eventProperties = {
			intent,
			import: hasImportGoal,
		};

		recordTracksEvent( 'calypso_signup_intent_select', eventProperties );
	};

	const handleSubmit = ( submittedGoals: Onboard.SiteGoal[] ) => {
		const intent = handleChange( submittedGoals );
		recordGoalsSelectTracksEvent( submittedGoals, intent );
		recordIntentSelectTracksEvent( submittedGoals, intent );
		navigation.submit?.( { intent } );
	};

	const stepContent = (
		<SelectGoals selectedGoals={ goals } onChange={ handleChange } onSubmit={ handleSubmit } />
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
