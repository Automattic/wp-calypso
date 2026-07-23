/**
 * Returns the next step for cancellation or the last step if at the last step.
 * @param currentStep The name of the current step
 * @param steps The array of step names for the current survey
 * @returns The name of the next (or last) step
 */
export default function nextStep( currentStep: string, steps: string[] ): string {
	const index = steps.indexOf( currentStep );

	if ( index >= 0 && index < steps.length - 1 ) {
		return steps[ index + 1 ];
	}

	return steps[ steps.length - 1 ];
}
