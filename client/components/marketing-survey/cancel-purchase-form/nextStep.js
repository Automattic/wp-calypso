export default function nextStep( currentStep, steps ) {
	const index = steps.indexOf( currentStep );

	if ( index >= 0 && index < steps.length - 1 ) {
		return steps[ index + 1 ];
	}

	return false;
}
