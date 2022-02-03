import { useCallback } from '@wordpress/element';
import { useHistory } from 'react-router-dom';
import { useStepRouteParam } from '../path';
import { useSteps } from './use-steps';

export function useStepNavigation() {
	const step = useStepRouteParam();
	const steps = useSteps();
	const history = useHistory();

	const goNext = useCallback( () => {
		const index = steps.indexOf( step );
		const goTo = steps[ Math.min( index + 1, steps.length - 1 ) ];
		history.push( `/${ goTo }` );
	}, [ step, steps, history ] );

	const goBack = useCallback( () => {
		const index = steps.indexOf( step );
		const goTo = steps[ Math.max( index - 1, 0 ) ];
		history.push( `/${ goTo }` );
	}, [ step, steps, history ] );

	return { currentStep: step, goBack, goNext };
}
