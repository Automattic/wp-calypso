import classnames from 'classnames';
import { useEffect } from 'react';
import Modal from 'react-modal';
import { Switch, Route, Redirect, generatePath, useHistory, useLocation } from 'react-router-dom';
import WordPressLogo from 'calypso/components/wordpress-logo';
import SignupHeader from 'calypso/signup/signup-header';
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
	const currentRoute = location.pathname.substring( 1 ) as StepPath;
	const history = useHistory();
	const { search } = useLocation();
	const stepNavigation = flow.useStepNavigation( currentRoute, ( path ) => {
		const _path = path.includes( '?' ) // does path contain search params
			? generatePath( '/' + path )
			: generatePath( '/' + path + search );

		history.push( _path, stepPaths );
	} );

	flow.useSideEffect?.();

	useEffect( () => {
		window.scrollTo( 0, 0 );
	}, [ location ] );

	useEffect( () => {
		recordStepStart( flow.name, kebabCase( currentRoute ) );
	}, [ flow.name, currentRoute ] );

	const assertCondition = flow.useAssertConditions?.() ?? { state: AssertConditionState.SUCCESS };

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
		return <StepComponent navigation={ stepNavigation } flow={ flow.name } />;
	};

	return (
		<Switch>
			{ stepPaths.map( ( path ) => {
				return (
					<Route key={ path } path={ `/${ path }` }>
						<div className={ classnames( flow.name, flow.classnames, kebabCase( path ) ) }>
							<SignupHeader />
							{ renderStep( path ) }
						</div>
					</Route>
				);
			} ) }
			<Route>
				<Redirect to={ stepPaths[ 0 ] + search } />
			</Route>
		</Switch>
	);
};
