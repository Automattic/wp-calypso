import type { Step } from './types';

/**
 * The domain picker step
 */
export const domain: Step = function DomainStep( { navigation } ) {
	const { goNext } = navigation;
	return (
		<div>
			<h1>Domains step</h1>
			<button onClick={ goNext }>Next</button>
		</div>
	);
};

/**
 * The design picker step
 */
export const design: Step = function DesignStep( { navigation } ) {
	const { goNext } = navigation;

	return (
		<div>
			<h1>Design step</h1>
			<button onClick={ goNext }>Next</button>
		</div>
	);
};

export type StepPath = 'domain' | 'design';
