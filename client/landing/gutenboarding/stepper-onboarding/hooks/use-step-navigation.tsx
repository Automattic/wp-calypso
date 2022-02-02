import React from 'react';
import { useHistory } from 'react-router-dom';
import { useStepRouteParam } from '../path';
import { useSteps } from './use-steps';

export function useStepNavigation() {
	const step = useStepRouteParam();
	const steps = useSteps();
	const history = useHistory();

	const goNext = React.useCallback( () => {
		const currentIndex = steps.indexOf( step );
		const goTo = steps[ Math.min( currentIndex + 1, steps.length - 1 ) ];
		history.push( `/${ goTo }` );
	}, [ step, steps, history ] );

	const goBack = React.useCallback( () => {
		const currentIndex = steps.indexOf( step );
		const goTo = steps[ Math.max( currentIndex - 1, 0 ) ];
		history.push( `/${ goTo }` );
	}, [ step, steps, history ] );

	return { currentStep: step, goBack, goNext };
}
