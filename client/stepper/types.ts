/** Step */
export type StepOptions = Record< string, unknown >;

export interface Step {
	slug: string;
	options?: StepOptions;
	Render: React.FunctionComponent< { onNext?: ( slug?: string ) => void } >;
}

/** Flow */
export interface FlowStep< Path extends string > extends Step {
	path: Path;
}

export type FlowStepIndex< P extends string > = Map< string, FlowStep< P > >;

export interface Flow< P extends string > {
	path: string;
	steps: FlowStepIndex< P >;
	Render: React.FunctionComponent< {
		Next: React.FunctionComponent< { path: string } >;
		step: Step;
		index: FlowStepIndex< P >;
	} >;
}
