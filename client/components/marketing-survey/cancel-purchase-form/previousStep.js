export default function previousStep( currentStep, steps ) {
	const index = steps.indexOf( currentStep );

	if ( index > 0 ) {
		return steps[ index - 1 ];
	}

	return false;
}
