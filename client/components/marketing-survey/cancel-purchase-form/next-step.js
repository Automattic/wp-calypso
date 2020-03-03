/**
 * Returns the next step for cancellation or the last step if at the last step.
 *
 * @param {string} currentStep The name of the current step
 * @param {Array}  steps The array of step names for the current survey
 * @returns {string} The name of the last (or last) step
 */
export default function nextStep( currentStep, steps ) {
	const index = steps.indexOf( currentStep );

	if ( index >= 0 && index < steps.length - 1 ) {
		return steps[ index + 1 ];
	}

	return steps[ steps.length - 1 ];
}
