import { ProgressBar } from '@automattic/components';
import { isNewsletterOrLinkInBioFlow } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useEffect } from 'react';
import Modal from 'react-modal';
import { Switch, Route, Redirect, generatePath, useHistory, useLocation } from 'react-router-dom';
import DocumentHead from 'calypso/components/data/document-head';
import WordPressLogo from 'calypso/components/wordpress-logo';
import { STEPPER_INTERNAL_STORE } from 'calypso/landing/stepper/stores';
import SignupHeader from 'calypso/signup/signup-header';
import { ONBOARD_STORE } from '../../stores';
import recordStepStart from './analytics/record-step-start';
import * as Steps from './steps-repository';
import { AssertConditionState, Flow } from './types';
import type { StepPath } from './steps-repository';
import './global.scss';

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

	const stepPaths = flow.useSteps();
	const location = useLocation();
	const currentRoute = location.pathname.substring( 1 ).replace( /\/+$/, '' ) as StepPath;
	const history = useHistory();
	const { search } = useLocation();
	const { setStepData } = useDispatch( STEPPER_INTERNAL_STORE );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const stepNavigation = flow.useStepNavigation( currentRoute, async ( path, extraData = null ) => {
		// If any extra data is passed to the navigate() function, store it to the stepper-internal store.
		setStepData( {
			path: path,
			intent: intent,
			...extraData,
		} );

		const _path = path.includes( '?' ) // does path contain search params
			? generatePath( '/' + path )
			: generatePath( '/' + path + search );

		history.push( _path, stepPaths );
	} );
	// Retrieve any extra step data from the stepper-internal store. This will be passed as a prop to the current step.
	const stepData = useSelect( ( select ) => select( STEPPER_INTERNAL_STORE ).getStepData() );

	flow.useSideEffect?.();

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ location ] );

	useEffect( () => {
		recordStepStart( flow.name, kebabCase( currentRoute ), { intent } );
	}, [ flow.name, currentRoute, intent ] );

	const assertCondition = flow.useAssertConditions?.() ?? { state: AssertConditionState.SUCCESS };

	const stepProgress = useSelect( ( select ) => select( ONBOARD_STORE ).getStepProgress() );
	const progressValue = stepProgress ? stepProgress.progress / stepProgress.count : 0;

	const renderStep = ( path: StepPath ) => {
		switch ( assertCondition.state ) {
			case AssertConditionState.CHECKING:
				/* eslint-disable wpcalypso/jsx-classname-namespace */
				return <WordPressLogo size={ 72 } className="wpcom-site__logo" />;
			/* eslint-enable wpcalypso/jsx-classname-namespace */
			case AssertConditionState.FAILURE:
				throw new Error( assertCondition.message ?? 'An error has occurred.' );
		}

		const StepComponent = Steps[ path ];
		return <StepComponent navigation={ stepNavigation } flow={ flow.name } data={ stepData } />;
	};

	const getDocumentHeadTitle = () => {
		if ( isNewsletterOrLinkInBioFlow( flow.name ) ) {
			return flow.title;
		}
	};

	return (
		<>
			<DocumentHead title={ getDocumentHeadTitle() } />
			<Switch>
				{ stepPaths.map( ( path ) => {
					return (
						<Route key={ path } path={ `/${ path }` }>
							<div className={ classnames( flow.name, flow.classnames, kebabCase( path ) ) }>
								<ProgressBar
									// eslint-disable-next-line wpcalypso/jsx-classname-namespace
									className="flow-progress"
									value={ progressValue * 100 }
									total={ 100 }
								/>
								<SignupHeader pageTitle={ flow.title } />
								{ renderStep( path ) }
							</div>
						</Route>
					);
				} ) }
				<Route>
					<Redirect to={ stepPaths[ 0 ] + search } />
				</Route>
			</Switch>
		</>
	);
};
