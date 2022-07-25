import { isEnabled } from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
import { useSite } from '../../../../hooks/use-site';
import { GoalsCaptureContainer } from './goals-capture-container';
import SelectGoals from './select-goals';
import type { Step } from '../../types';
import './style.scss';

type TracksGoalsSelectEventProperties = {
	goals: string;
	combo: string;
	total: number;
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

const displayAllGoals = isEnabled( 'signup/goals-step-2' );
const refGoals: Record< string, Onboard.SiteGoal[] > = {
	'create-blog-lp': [ SiteGoal.Write ],
};

/**
 * The goals capture step
 */
const GoalsStep: Step = ( { navigation } ) => {
	const translate = useTranslate();
	const welcomeText = translate( 'Welcome!' );
	const whatAreYourGoalsText = translate( 'What are your goals?' );
	const subHeaderText = translate( 'Tell us what would you like to accomplish with your website.' );

	const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
	const { setGoals, setIntent, clearImportGoal, clearDIFMGoal, resetIntent } =
		useDispatch( ONBOARD_STORE );

	const site = useSite();
	const { saveSiteTitle } = useDispatch( SITE_STORE );
	const refParameter = getQueryArgs()?.ref as string;

	const getSiteTitle = ( intent: Onboard.SiteIntent ) => {
		if ( intent === Onboard.SiteIntent.Write ) {
			return translate( 'My blog' );
		}

		if ( intent === Onboard.SiteIntent.Sell ) {
			return translate( 'My store' );
		}

		return translate( 'My site' );
	};

	useEffect( () => {
		if ( ! displayAllGoals ) {
			clearDIFMGoal();
			clearImportGoal();
		}

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

	const handleSubmit = async ( submittedGoals: Onboard.SiteGoal[] ) => {
		setGoals( submittedGoals );

		const intent = goalsToIntent( submittedGoals );
		setIntent( intent );
		if ( site ) {
			await saveSiteTitle( site.ID, getSiteTitle( intent ) );
		}

		recordGoalsSelectTracksEvent( submittedGoals, intent );
		recordIntentSelectTracksEvent( submittedGoals, intent );

		navigation.submit?.( { intent } );
	};

	const stepContent = (
		<SelectGoals
			displayAllGoals={ displayAllGoals }
			selectedGoals={ goals }
			onChange={ setGoals }
			onSubmit={ handleSubmit }
		/>
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
			<DocumentHead title={ whatAreYourGoalsText } />

			<GoalsCaptureContainer
				displayAllGoals={ displayAllGoals }
				welcomeText={ welcomeText }
				whatAreYourGoalsText={ whatAreYourGoalsText }
				subHeaderText={ subHeaderText }
				stepName={ 'goals-step' }
				goNext={ navigation.goNext }
				skipLabelText={ translate( 'Skip to dashboard' ) }
				skipButtonAlign={ 'top' }
				hideBack={ true }
				stepContent={ stepContent }
				recordTracksEvent={ recordTracksEvent }
			/>
		</>
	);
};

export default GoalsStep;
