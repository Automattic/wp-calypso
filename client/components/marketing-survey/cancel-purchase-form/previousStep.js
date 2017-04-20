/**
 * Internal dependencies
 */
import stepsForProductAndSurvey from './stepsForProductAndSurvey';

export default function previousStep( currentStep, survey, product ) {
	const steps = stepsForProductAndSurvey( survey, product );
	const index = steps.indexOf( currentStep );

	if ( index > 0 ) {
		return steps[ index - 1 ];
	}

	return false;
}
