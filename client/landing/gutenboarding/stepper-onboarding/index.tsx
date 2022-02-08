import { useState } from '@wordpress/element';
import { Route, Switch, Redirect } from 'react-router-dom';

/** Step */

type StepOptions = Record< string, unknown >;
interface Step {
	uid: string;
	options?: StepOptions;
	Render: React.FunctionComponent< { onNext: ( uid: string ) => void } >;
}

/** Flow */
interface FlowStep< Path extends string > extends Step {
	path: Path;
}

type FlowStepIndex< P extends string > = Record< string, FlowStep< P > >;

interface Flow< N extends string, P extends string > {
	path: string;
	steps: FlowStepIndex< P >;
	Render: React.FunctionComponent< {
		Next: React.FunctionComponent< { path: string } >;
		stepName: N;
	} >;
}

/** Rambo Flow */

const ramboFlowPaths = [ '/rambo/first', '/rambo/second', '/rambo/third' ] as const;

type RamboFlowIndex = Record< string, FlowStep< typeof ramboFlowPaths[ number ] > >;

const RamboFirstBlood: Step = {
	uid: 'rambo-first-blood',
	Render: ( { onNext } ) => {
		return (
			<>
				<div>Rambo First Blood</div>
				<button onClick={ () => onNext( 'rambo-first-blood-ii' ) }>Next</button>
			</>
		);
	},
};

const RamboFirstBloodII: Step = {
	uid: 'rambo-first-blood-ii',
	Render: ( { onNext } ) => {
		return (
			<>
				<div>Rambo First Blood II</div>
				<button onClick={ () => onNext( 'rambo-first-blood' ) }>Previous</button>
			</>
		);
	},
};

const ramboFlowIndex: RamboFlowIndex = {
	[ RamboFirstBlood.uid ]: {
		path: '/rambo/first',
		...RamboFirstBlood,
	},
	[ RamboFirstBloodII.uid ]: {
		path: '/rambo/second',
		...RamboFirstBloodII,
	},
};

const ramboFlow: Flow< string, typeof ramboFlowIndex[ string ][ 'path' ] > = {
	path: '/rambo',
	steps: ramboFlowIndex,
	Render: ( { Next, stepName } ) => {
		const [ next, setNext ] = useState< string | null >( null );

		const handleNext = ( uid: string ) => {
			setNext( uid );
		};

		if ( next ) {
			return Next( { path: ramboFlowIndex[ next ].path } );
		}

		return (
			<div>
				<h3>Step { stepName }:</h3>
				<section>{ ramboFlowIndex[ stepName ].Render( { onNext: handleNext } ) }</section>
			</div>
		);
	},
};

const useFlows = () => {
	return [ ramboFlow ];
};

export function Stepper() {
	const NextHandler: React.FunctionComponent< { path: string } > = ( { path } ) => {
		return <Redirect to={ path } />;
	};

	const flows = useFlows();

	return (
		<Switch>
			{ flows.map( ( flow ) => (
				<>
					<Route path={ flow.path } key={ flow.path }>
						<Redirect to={ Object.values( flow.steps )[ 0 ].path } />
					</Route>
					{ Object.values( flow.steps ).map( ( step ) => (
						<Route path={ step.path } key={ step.uid }>
							{ flow.Render( {
								Next: NextHandler,
								stepName: step.uid,
							} ) }
						</Route>
					) ) }
				</>
			) ) }
			<Route>
				<div>No match</div>
			</Route>
		</Switch>
	);
}

export default function App() {
	return <Stepper />;
}
