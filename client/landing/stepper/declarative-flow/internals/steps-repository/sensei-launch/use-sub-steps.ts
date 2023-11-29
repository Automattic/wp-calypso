import { useEffect, useState } from 'react';

export const wait = ( ms: number ) => new Promise( ( res ) => setTimeout( res, ms ) );

/**
 * A step in a linear installation process.
 * @param {number} retries Number of times this step was executed.
 * @returns Should resolve to true if the step was completed, false if it needs to be run again.
 */
type SubStep = ( retries: number ) => Promise< boolean >;

type StepStatus = {
	current: number;
	retries: number;
};

type SubStepSettings = {
	maxRetries: number;
	onFail: () => void;
};

/**
 * Run a series of steps in order, re-running each step until it's complete.
 *
 * Steps should take care of waiting for requests or time delays, and resolve the returned promise
 * to false when they are ready to run again, or true when they are complete and we can proceed
 * with the next step.
 * @returns {number} Progress percentage.
 */
export const useSubSteps = (
	steps: SubStep[],
	{ maxRetries, onFail }: SubStepSettings
): number => {
	const [ { current, retries }, setStepStatus ] = useState< StepStatus >( {
		current: 0,
		retries: 0,
	} );

	useEffect( () => {
		const stepFunction = steps[ current ];

		if ( retries > maxRetries ) {
			onFail();
			return;
		}

		if ( ! stepFunction ) {
			return;
		}

		stepFunction( retries ).then( ( result ) => {
			setStepStatus( {
				current: result ? current + 1 : current,
				retries: result ? 0 : retries + 1,
			} );
		} );
		// eslint-disable-next-line react-hooks/exhaustive-deps -- Only run on state change.
	}, [ current, retries ] );

	const percentagePerStep = 100 / ( steps.length || 10 );
	const currentStepProgress = Math.min(
		percentagePerStep * 0.9,
		( percentagePerStep / 10 ) * retries
	);
	const progress = current * percentagePerStep + currentStepProgress;

	return progress;
};
