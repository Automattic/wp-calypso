import { Switch, Route, Redirect, generatePath, useHistory, useLocation } from 'react-router-dom';
import * as Steps from './steps-repository';
import type { StepPath } from './steps-repository';
import type { Flow } from './types';
import './global.scss';

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
	const stepPaths = flow.useSteps();
	const currentRoute = useLocation().pathname.substring( 1 ) as StepPath;
	const history = useHistory();
	const stepNavigation = flow.useStepNavigation( currentRoute, ( path: StepPath ) =>
		history.push( generatePath( path ), stepPaths )
	);
	const { search } = useLocation();

	return (
		<Switch>
			{ stepPaths.map( ( path ) => {
				const StepComponent = Steps[ path ];
				return (
					<Route key={ path } path={ `/${ path }` }>
						<StepComponent navigation={ stepNavigation } />
					</Route>
				);
			} ) }
			<Route>
				<Redirect to={ stepPaths[ 0 ] + search } />
			</Route>
		</Switch>
	);
};
