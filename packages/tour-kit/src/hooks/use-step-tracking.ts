/**
 * External Dependencies
 */
import { useState, useEffect } from '@wordpress/element';
/**
 * Internal Dependencies
 */
import { Callback } from '../types';

const useStepTracking = (
	currentStepIndex: number,
	onStepViewOnce: Callback | undefined
): void => {
	const [ stepsViewed, setStepsViewed ] = useState< number[] >( [] );

	useEffect( () => {
		if ( stepsViewed.includes( currentStepIndex ) ) {
			return;
		}

		setStepsViewed( ( prev ) => [ ...prev, currentStepIndex ] );
		onStepViewOnce?.( currentStepIndex );
	}, [ currentStepIndex, onStepViewOnce, stepsViewed ] );
};

export default useStepTracking;
