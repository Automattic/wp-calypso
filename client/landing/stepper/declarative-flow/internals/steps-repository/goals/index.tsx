import { Onboard } from '@automattic/data-stores';
import { Step } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { type ReactNode, useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import { isGoalsBigSkyEligible } from 'calypso/landing/stepper/hooks/use-is-site-big-sky-eligible';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getQueryArgs } from 'calypso/lib/query-args';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { useCreateCourseGoalFeature } from '../../hooks/use-create-course-goal-feature';
import DashboardIcon from './dashboard-icon';
import { GoalsCaptureContainer } from './goals-capture-container';
import SelectGoals from './select-goals';
import type { Step as StepType } from '../../types';
import type { OnboardSelect } from '@automattic/data-stores';
import './style.scss';

type KebabToSnakeCase< S extends string > = S extends `${ infer T }${ infer U }`
	? `${ T extends '-' ? '_' : T }${ KebabToSnakeCase< U > }`
	: S;

type TracksGoalsSelectEventProperties = {
	flow: string;
	goals: string;
	combo: string;
	total: number;
	ref?: string;
	intent: string;
	is_goals_big_sky_eligible: boolean;
} & {
	[ key in Onboard.SiteGoal as KebabToSnakeCase< key > ]?: number;
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
const GoalsStep: StepType< {
	submits: {
		intent: Onboard.SiteIntent;
		skip?: true;
		action?: 'dashboard';
		shouldSkipSubmitTracking?: true;
	};
} > = ( { navigation, flow } ) => {
	const translate = useTranslate();
	const whatAreYourGoalsText = translate( 'What would you like to do?' );
	const subHeaderText = translate(
		"Pick one or more goals and we'll tailor the setup experience for you."
	);

	const goals = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
		[]
	);
	const { setGoals, setIntent, resetIntent } = useDispatch( ONBOARD_STORE );
	const refParameter = getQueryArgs()?.ref as string;

	const isIntentCreateCourseGoalEnabled = useCreateCourseGoalFeature();

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
		const commonEventProps = {
			ref: refParameter ?? null,
		};

		const goalsSelectProperties: TracksGoalsSelectEventProperties = {
			...commonEventProps,
			intent,
			goals: serializeGoals( goals ),
			combo: goals.slice().sort().join( ',' ),
			total: goals.length,
			is_goals_big_sky_eligible: isGoalsBigSkyEligible( goals ),
			flow,
		};

		goals.forEach( ( goal, i ) => {
			// This is done to conform to Tracks event property naming conventions.
			const snakeCaseGoal = goal.replaceAll( '-', '_' ) as KebabToSnakeCase< typeof goal >;
			goalsSelectProperties[ snakeCaseGoal ] = i + 1;

			recordTracksEvent( 'calypso_signup_goals_single_select', {
				...commonEventProps,
				goal,
			} );
		} );

		recordTracksEvent( 'calypso_signup_goals_select', goalsSelectProperties );
	};

	const recordNavigationSelectTracksEvent = ( intent: Onboard.SiteIntent, action: string ) => {
		recordTracksEvent( 'calypso_signup_intent_select', { intent } );
		recordTracksEvent( 'calypso_signup_goals_nav_click', { action } );
	};

	const getStepSubmissionHandler = ( action: string ) => () => {
		const intent = goalsToIntent( goals, {
			isIntentCreateCourseGoalEnabled,
		} );
		setIntent( intent );

		recordGoalsSelectTracksEvent( goals, intent );
		recordNavigationSelectTracksEvent( intent, action );

		navigation.submit?.( { intent } );
	};

	const handleSkip = getStepSubmissionHandler( 'skip' );
	const handleNext = getStepSubmissionHandler( 'next' );

	const handleImportClick = () => {
		setIntent( SiteIntent.Import );
		recordNavigationSelectTracksEvent( SiteIntent.Import, 'import' );
		navigation.submit?.( { intent: SiteIntent.Import, shouldSkipSubmitTracking: true } );
	};

	const handleDIFMClick = () => {
		setIntent( SiteIntent.DIFM );
		recordNavigationSelectTracksEvent( SiteIntent.DIFM, 'difm' );
		navigation.submit?.( { intent: SiteIntent.DIFM, shouldSkipSubmitTracking: true } );
	};

	const handleDashboardClick = () => {
		setIntent( SiteIntent.Build );
		recordNavigationSelectTracksEvent( SiteIntent.Build, 'dashboard' );
		navigation.submit?.( {
			intent: SiteIntent.Build,
			skip: true,
			action: 'dashboard',

			// This is a "skip" event when isAddedGoalsExp is false, and otherwise it's an exit flow event
			shouldSkipSubmitTracking: true,
		} );
	};

	useEffect( () => {
		const isValidRef = Object.keys( refGoals ).includes( refParameter );

		if ( isValidRef && goals.length === 0 ) {
			setGoals( refGoals[ refParameter ] );
		}
		// Deliberately not including all deps in the deps array
		// This hook is only meant to be executed when either refParameter, refGoals change in value
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ refParameter, refGoals ] );

	const getStepContent = ( nextButton?: ReactNode ) => (
		<div className="select-goals">
			<SelectGoals selectedGoals={ goals } onChange={ setGoals } />
			{ nextButton }
			<div className="select-goals__alternative-flows-container">
				<Button variant="link" onClick={ handleImportClick } className="select-goals__link">
					{ translate( 'Import or migrate an existing site' ) }
				</Button>
				<span className="select-goals__link-separator" />
				<Button variant="link" onClick={ handleDIFMClick } className="select-goals__link">
					{ translate( 'Let us build a custom site for you' ) }
				</Button>
				<Button
					variant="link"
					onClick={ handleDashboardClick }
					className="select-goals__link select-goals__dashboard-button"
				>
					<DashboardIcon />
					{ translate( 'Skip to dashboard' ) }
				</Button>
			</div>
		</div>
	);

	const isMediumOrBiggerScreen = useViewportMatch( 'small', '>=' );

	const getStep = () => {
		if ( shouldUseStepContainerV2( flow ) ) {
			const nextButton = <Step.PrimaryButton onClick={ handleNext } />;

			return (
				<Step.CenteredColumnLayout
					columnWidth={ 6 }
					className="step-container-v2--goals"
					topBar={ <Step.TopBar rightElement={ <Step.SkipButton onClick={ handleSkip } /> } /> }
					heading={ <Step.Heading text={ whatAreYourGoalsText } subText={ subHeaderText } /> }
					stickyBottomBar={ <Step.StickyBottomBar rightElement={ nextButton } /> }
				>
					{ ( { isSmallViewport } ) => getStepContent( isSmallViewport && nextButton ) }
				</Step.CenteredColumnLayout>
			);
		}

		return (
			<GoalsCaptureContainer
				whatAreYourGoalsText={ whatAreYourGoalsText }
				subHeaderText={ subHeaderText }
				stepName="goals-step"
				onSkip={ handleSkip }
				goNext={ handleNext }
				nextLabelText={ translate( 'Next' ) }
				skipLabelText={ translate( 'Skip' ) }
				recordTracksEvent={ recordTracksEvent }
				stepContent={ getStepContent(
					isMediumOrBiggerScreen && (
						<Button
							__next40pxDefaultSize
							className="select-goals__next"
							variant="primary"
							onClick={ handleNext }
						>
							{ translate( 'Next' ) }
						</Button>
					)
				) }
			/>
		);
	};

	return (
		<>
			<DocumentHead title={ whatAreYourGoalsText } />

			{ getStep() }
		</>
	);
};

export default GoalsStep;
