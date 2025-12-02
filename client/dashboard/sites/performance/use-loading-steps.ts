import { useState } from '@wordpress/element';
import { useInterval } from 'calypso/lib/interval/use-interval';

const useLoadingSteps = ( { steps, duration = 5000 }: { steps: string[]; duration?: number } ) => {
	const [ step, setStep ] = useState( 0 );

	useInterval(
		() => {
			setStep( ( step ) => step + 1 );
		},
		// duration between steps, except make sure we stop _before_ completing the last step
		step < steps.length - 1 && duration
	);

	return {
		step,
		steps,
	};
};

export default useLoadingSteps;
