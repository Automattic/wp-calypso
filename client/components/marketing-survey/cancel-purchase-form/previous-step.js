/**
 * Returns the previous step for cancellation or the first step if at the first step.
 *
 * @param {string} currentStep The name of the current step
 * @param {Array}  steps The array of step names for the current survey
 * @returns {string} The name of the previous (or first) step
 */
export default function previousStep( currentStep, steps ) {
	const index = steps.indexOf( currentStep );

	if ( index > 0 ) {
		return steps[ index - 1 ];
	}

	return steps[ 0 ];
}
