import { ProgressBar } from '@automattic/components';
import {
	isNewsletterOrLinkInBioFlow,
	isWooExpressFlow,
	SITE_SETUP_FLOW,
} from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { lazy, useEffect, useState, useCallback, Suspense } from 'react';
import Modal from 'react-modal';
import { Switch, Route, Redirect, generatePath, useHistory, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordPageView } from 'calypso/lib/analytics/page-view';
import { recordSignupStart } from 'calypso/lib/analytics/signup';
import SignupHeader from 'calypso/signup/signup-header';
import { ONBOARD_STORE } from '../../stores';
import recordStepStart from './analytics/record-step-start';
import StepperLoader from './components/stepper-loader';
import VideoPressIntroBackground from './steps-repository/intro/videopress-intro-background';
import { AssertConditionState, Flow, StepperStep } from './types';
import './global.scss';
import type { OnboardSelect, StepperInternalSelect } from '@automattic/data-stores';

const kebabCase = ( value: string ) => value.replace( /([a-z0-9])([A-Z])/g, '$1-$2' ).toLowerCase();

/**
 * This component accepts a single flow property. It does the following:
 *
 * 1. It renders a react-router route for every step in the flow.
 * 2. It gives every step the ability to navigate back and forth within the flow
 * 3. It's responsive to the dynamic changes in side the flow's hooks (useSteps and useStepsNavigation)
 *
 * @param props
 * @param props.flow the flow you want to render
 * @returns A React router switch will all the routes
 */
export const FlowRenderer: React.FC< { flow: Flow } > = ( { flow } ) => {
	// Configure app element that React Modal will aria-hide when modal is open
	Modal.setAppElement( '#wpcom' );
	const flowSteps = flow.useSteps();
	const stepPaths = flowSteps.map( ( step ) => step.slug );
	const location = useLocation();
	const currentStepRoute = location.pathname.split( '/' )[ 2 ]?.replace( /\/+$/, '' );
	const history = useHistory();
	const { search } = useLocation();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const ref = useQuery().get( 'ref' ) || '';

	const stepProgress = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStepProgress(),
		[]
	);
	const progressValue = stepProgress ? stepProgress.progress / stepProgress.count : 0;
	const [ previousProgress, setPreviousProgress ] = useState(
		stepProgress ? stepProgress.progress : 0
	);
	const previousProgressValue = stepProgress ? previousProgress / stepProgress.count : 0;

	const isFlowStart = useCallback( () => {
		if ( ! flow || ! stepProgress ) {
			return false;
		}
		if ( stepProgress?.progress === 0 ) {
			return true;
		}
		if ( flow.name === 'sensei' && stepProgress?.progress === 1 ) {
			return true;
		}
		return false;
	}, [ flow, stepProgress ] );

	const navigate = async ( path: string, extraData = {} ) => {
		// If any extra data is passed to the navigate() function, store it to the stepper-internal store.
		setStepData( {
			path: path,
			intent: intent,
			...extraData,
		} );

		const _path = path.includes( '?' ) // does path contain search params
			? generatePath( `/${ flow.name }/${ path }` )
			: generatePath( `/${ flow.name }/${ path }${ search }` );

		history.push( _path, stepPaths );
		setPreviousProgress( stepProgress?.progress ?? 0 );
	};

	const stepNavigation = flow.useStepNavigation( currentStepRoute, navigate );

	// Retrieve any extra step data from the stepper-internal store. This will be passed as a prop to the current step.
	const stepData = useSelect(
		( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
		[]
	);

	flow.useSideEffect?.( currentStepRoute, navigate );

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ location ] );

	useEffect( () => {
		if ( isFlowStart() ) {
			recordSignupStart( flow.name, ref );
			recordFullStoryEvent( `calypso_signup_start_${ flow.name }`, { flow: flow.name } );
		}
	}, [ flow, ref, isFlowStart ] );

	useEffect( () => {
		// We record the event only when the step is not empty. Additionally, we should not fire this event whenever the intent is changed
		if ( currentStepRoute ) {
			recordStepStart( flow.name, kebabCase( currentStepRoute ), { intent } );

			// Also record page view for data and analytics
			const pathname = window.location.pathname || '';
			const pageTitle = `Setup > ${ flow.name } > ${ currentStepRoute }`;
			recordPageView( pathname, pageTitle );
		}

		// We leave out intent from the dependency list, due to the ONBOARD_STORE being reset in the exit flow.
		// This causes the intent to become empty, and thus this event being fired again.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flow.name, currentStepRoute ] );

	const assertCondition = flow.useAssertConditions?.() ?? { state: AssertConditionState.SUCCESS };

	const renderStep = ( step: StepperStep ) => {
		switch ( assertCondition.state ) {
			case AssertConditionState.CHECKING:
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				return <StepperLoader />;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			case AssertConditionState.FAILURE:
				throw new Error( assertCondition.message ?? 'An error has occurred.' );
		}

		const Component = lazy( step.component );

		return (
			<Component
				navigation={ stepNavigation }
				flow={ flow.name }
				stepName={ step.slug }
				data={ stepData }
				{ ...step.additionalComponentProps }
			/>
		);
	};

	const getDocumentHeadTitle = () => {
		if ( isNewsletterOrLinkInBioFlow( flow.name ) ) {
			return flow.title;
		}
	};

	const getShowWooLogo = () => {
		if ( isWooExpressFlow( flow.name ) ) {
			return true;
		}

		return false;
	};

	let progressBarExtraStyle: React.CSSProperties = {};
	if ( 'videopress' === flow.name ) {
		progressBarExtraStyle = {
			'--previous-progress': Math.min( 100, Math.ceil( previousProgressValue * 100 ) ) + '%',
			'--current-progress': Math.min( 100, Math.ceil( progressValue * 100 ) ) + '%',
		} as React.CSSProperties;
	}

	return (
		<Suspense fallback={ <StepperLoader /> }>
			<DocumentHead title={ getDocumentHeadTitle() } />
			<Switch>
				{ flowSteps.map( ( step ) => {
					return (
						<Route key={ step.slug } path={ `/${ flow.name }/${ step.slug }` }>
							<div className={ classnames( flow.name, flow.classnames, kebabCase( step.slug ) ) }>
								{ 'videopress' === flow.name && 'intro' === step.slug && (
									<VideoPressIntroBackground />
								) }
								{ flow.name !== SITE_SETUP_FLOW && (
									// The progress bar is removed from the site-setup due to its fragility.
									// See https://github.com/Automattic/wp-calypso/pull/73653
									<ProgressBar
										// eslint-disable-next-line wpcalypso/jsx-classname-namespace
										className="flow-progress"
										value={ progressValue * 100 }
										total={ 100 }
										style={ progressBarExtraStyle }
									/>
								) }
								<SignupHeader pageTitle={ flow.title } showWooLogo={ getShowWooLogo() } />
								{ renderStep( step ) }
							</div>
						</Route>
					);
				} ) }
				<Route>
					<Redirect to={ `/${ flow.name }/${ stepPaths[ 0 ] }${ search }` } />
				</Route>
			</Switch>
		</Suspense>
	);
};
