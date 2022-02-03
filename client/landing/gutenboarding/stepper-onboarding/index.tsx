import { Route, Switch } from 'react-router-dom';
import { useStepNavigation } from './hooks/use-step-navigation';
import { Steps } from './steps';

export function Stepper() {
	const { goNext, goBack } = useStepNavigation();

	return (
		<div>
			{ Object.values( Steps ).map( ( step ) => (
				<Switch>
					<Route path={ `/${ step }` } key={ step }>
						{ step } step
					</Route>
				</Switch>
			) ) }
			<div>
				<button onClick={ goBack }>Previous step</button>
				<button onClick={ goNext }>Next step</button>
			</div>
		</div>
	);
}

export default function App() {
	return <Stepper />;
}
