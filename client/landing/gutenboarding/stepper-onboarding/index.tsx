import { Route, Switch, Redirect } from 'react-router-dom';
import { useFlows } from './flows';

export function StepperRouter() {
	const NextHandler: React.FunctionComponent< { path: string } > = ( { path } ) => {
		return <Redirect to={ path } />;
	};

	const flows = useFlows();

	return (
		<>
			{ flows.map( ( flow ) => (
				<Switch>
					<Route exact path={ flow.path } key={ flow.path }>
						<Redirect to={ [ ...flow.steps.values() ][ 0 ].path } />
					</Route>
					{ [ ...flow.steps.values() ].map( ( step ) => (
						<Route exact path={ step.path } key={ `${ flow.path }-${ step.path }` }>
							<flow.Render
								Next={ NextHandler }
								step={ step }
								index={ flow.steps } // TS fail
							/>
						</Route>
					) ) }
				</Switch>
			) ) }
		</>
	);
}

export default function App() {
	return <StepperRouter />;
}
