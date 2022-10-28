import type { Step } from 'calypso/landing/stepper/declarative-flow/internals/types';

const SenseiPlan: Step = ( { navigation } ) => {
	const { goNext, goBack } = navigation;
	return (
		<div>
			<h1>Sensei Plan Step</h1>
			<button onClick={ goBack }>Back</button>
			<button onClick={ goNext }>Next</button>
		</div>
	);
};

export default SenseiPlan;
