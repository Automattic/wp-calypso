import { Onboard } from '@automattic/data-stores';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import intentImageUrl from 'calypso/assets/images/onboarding/intent.svg';
import DocumentHead from 'calypso/components/data/document-head';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
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

const refGoals: Record< string, Onboard.SiteGoal[] > = {
	'create-blog-lp': [ SiteGoal.Write ],
};

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const headerText = translate( 'Welcome!{{br/}}What are your goals?', {
		components: {
			br: <br />,
		},
	} );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
	const { setGoals, setIntent, clearImportGoal, clearDIFMGoal, resetIntent } =
		useDispatch( ONBOARD_STORE );
	const refParameter = getQueryArgs()?.ref as string;

	useEffect( () => {
		clearDIFMGoal();
		clearImportGoal();
		resetIntent();
	}, [ clearDIFMGoal, clearImportGoal, resetIntent ] );

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

		if ( refParameter ) {
			eventProperties.ref = refParameter as string;
		}

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
		setGoals( submittedGoals );

		const intent = goalsToIntent( submittedGoals );
		setIntent( intent );

		recordGoalsSelectTracksEvent( submittedGoals, intent );
		recordIntentSelectTracksEvent( submittedGoals, intent );

		navigation.submit?.( { intent } );
	};

	const stepContent = (
		<SelectGoals selectedGoals={ goals } onChange={ setGoals } onSubmit={ handleSubmit } />
	);

	useEffect( () => {
		const isValidRef = Object.keys( refGoals ).includes( refParameter );

		if ( isValidRef && goals.length === 0 ) {
			setGoals( refGoals[ refParameter ] );
		}
		// Delibirately not including all deps in the deps array
		// This hook is only meant to be executed when either refParameter, refGoals change in value
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ refParameter, refGoals ] );

	return (
		<>
			<DocumentHead title={ translate( 'What are your goals?' ) } />

			<StepContainer
				stepName={ 'goals-step' }
				goNext={ navigation.goNext }
				skipLabelText={ translate( 'Skip to dashboard' ) }
				skipButtonAlign={ 'top' }
				hideBack={ true }
				isHorizontalLayout={ true }
				headerImageUrl={ intentImageUrl }
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
		</>
	);
};

export default GoalsStep;
