import { Route, Switch, Redirect } from 'react-router-dom';
import { useFlows } from './flows';

export function Stepper() {
	const NextHandler: React.FunctionComponent< { path: string } > = ( { path } ) => {
		return <Redirect to={ path } />;
	};

	const flows = useFlows();

	return (
		<Switch>
			{ flows.map( ( flow ) => (
				<>
					{ [ ...flow.steps.values() ].map( ( step ) => (
						<Route path={ step.path } key={ step.slug }>
							{ flow.Render( {
								Next: NextHandler,
								step,
								index: flow.steps, // TS fail
							} ) }
						</Route>
					) ) }
					<Route path={ flow.path } key={ flow.path }>
						<Redirect to={ [ ...flow.steps.values() ][ 0 ].path } />
					</Route>
				</>
			) ) }
			<Route key="stepper-onboarding">
				<div>No match</div>
			</Route>
		</Switch>
	);
}

export default function App() {
	return <Stepper />;
}
