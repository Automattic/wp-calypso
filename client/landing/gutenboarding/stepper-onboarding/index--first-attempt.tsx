import { useState } from '@wordpress/element';
import { Route, Switch, Redirect } from 'react-router-dom';

/** Step */

type StepOptions = Record< string, unknown >;
type StepRender = React.FunctionComponent< {
	NextHandler: React.FunctionComponent< { path: string } >;
	options?: StepOptions;
} >;

interface Step< StepName extends string > {
	name: StepName;
	options?: StepOptions;
	StepRender: StepRender;
}

/** Flow */

interface Flow< FlowName extends string, StepNames extends string > {
	name: FlowName;
	steps: Step< StepNames >[];
}

/** Rocky Flow */

const rockyFlowName = '/rocky';

const rockyStepNames = [ '/rocky/first', '/rocky/second', '/rocky/third' ] as const;

const rockyFlow: Flow< typeof rockyFlowName, typeof rockyStepNames[ number ] > = {
	name: rockyFlowName,
	steps: [
		{
			name: rockyStepNames[ 0 ],
			StepRender: ( { NextHandler } ) => {
				const [ next, setNext ] = useState< typeof rockyStepNames[ number ] | undefined >();

				if ( next ) {
					return NextHandler( { path: next } );
				}

				return (
					<>
						<button onClick={ () => setNext( rockyStepNames[ 1 ] ) }>Next</button>
					</>
				);
			},
		},
		{
			name: rockyStepNames[ 1 ],
			StepRender: ( { NextHandler } ) => {
				const [ next, setNext ] = useState< typeof rockyStepNames[ number ] | undefined >();

				if ( next ) {
					return NextHandler( { path: next } );
				}

				return (
					<>
						<button onClick={ () => setNext( rockyStepNames[ 0 ] ) }>Previous</button>
						<button onClick={ () => setNext( rockyStepNames[ 2 ] ) }>Next</button>
					</>
				);
			},
		},
	],
};

const useFlows = () => {
	return [ rockyFlow ];
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
					<Route path={ flow.name }>
						<Redirect to={ flow.steps[ 0 ].name } />
					</Route>
					{ flow.steps.map( ( step ) => (
						<Route path={ step.name } key={ `${ flow.name }-${ step.name }` }>
							{ step.StepRender( { NextHandler } ) }
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
