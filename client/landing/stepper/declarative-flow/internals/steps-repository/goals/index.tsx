import { Onboard } from '@automattic/data-stores';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
import { GoalsCaptureContainer } from './goals-capture-container';
import SelectGoals from './select-goals';
import type { Step } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

type TracksGoalsSelectEventProperties = {
	goals: string;
	combo: string;
	total: number;
	write?: number;
	'paid-subscribers'?: number;
	'import-subscribers'?: number;
	promote?: number;
	sell?: number;
	difm?: number;
	import?: number;
	other?: number;
	ref?: string;
	intent: string;
};

const SiteGoal = Onboard.SiteGoal;
const SiteIntent = Onboard.SiteIntent;
const { serializeGoals, goalsToIntent } = Onboard.utils;

const refGoals: Record< string, Onboard.SiteGoal[] > = {
	'create-blog-lp': [ SiteGoal.Write ],
};

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const whatAreYourGoalsText = translate( 'What would you like to do?' );
	const subHeaderText = translate(
		'Pick one or more goals and we’ll tailor the setup experience for you.'
	);

	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);
	const { setGoals, setIntent, resetIntent } = useDispatch( ONBOARD_STORE );
	const refParameter = getQueryArgs()?.ref as string;

	useEffect( () => {
		resetIntent();

		// Delibirately not including all deps in the deps array
		// This hook is only meant to be executed in the first render
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const recordGoalsSelectTracksEvent = (
		goals: Onboard.SiteGoal[],
		intent: Onboard.SiteIntent
	) => {
		const eventProperties: TracksGoalsSelectEventProperties = {
			goals: serializeGoals( goals ),
			combo: goals.sort().join( ',' ),
			total: goals.length,
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

	const handleImportClick = () => {
		setIntent( SiteIntent.Import );
		recordIntentSelectTracksEvent( [], SiteIntent.Import );
		navigation.submit?.( { intent: SiteIntent.Import } );
	};

	const handleDIFMClick = () => {
		setIntent( SiteIntent.DIFM );
		recordIntentSelectTracksEvent( [], SiteIntent.DIFM );
		navigation.submit?.( { intent: SiteIntent.DIFM } );
	};

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
			<DocumentHead title={ whatAreYourGoalsText } />

			<GoalsCaptureContainer
				whatAreYourGoalsText={ whatAreYourGoalsText }
				subHeaderText={ subHeaderText }
				stepName="goals-step"
				goNext={ navigation.goNext }
				skipLabelText={ translate( 'Skip to dashboard' ) }
				skipButtonAlign="top"
				hideBack
				recordTracksEvent={ recordTracksEvent }
				stepContent={
					<>
						<SelectGoals selectedGoals={ goals } onChange={ setGoals } />
						<div className="select-goals__alternative-flows-container">
							<Button variant="link" onClick={ handleImportClick } className="select-goals__link">
								{ translate( 'Import or migrate an existing site' ) }
							</Button>
							<span className="select-goals__link-separator" />
							<Button variant="link" onClick={ handleDIFMClick } className="select-goals__link">
								{ translate( 'Let us build a custom site for you' ) }
							</Button>
						</div>
					</>
				}
			/>
		</>
	);
};

export default GoalsStep;
