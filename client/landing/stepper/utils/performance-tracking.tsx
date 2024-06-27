import { useLayoutEffect, useMemo } from 'react';
import { useStore } from 'react-redux';
import {
	startPerformanceTracking,
	stopPerformanceTracking,
} from 'calypso/lib/performance-tracking/lib';

// Manually start performance tracking.
// Used in the entry point to start data collection as close as possible to boot time.
export function startStepperPerformanceTracking( {
	fullPageLoad = false,
}: {
	fullPageLoad?: boolean;
} ) {
	startPerformanceTracking( 'stepper', { fullPageLoad } );
}

// This hook starts performance gathering for the Stepper everytime the flow or step change.
// The library we're using ignores follow-up `start` calls while there's an inflight tracking
// report, so this hook is always safe, even though the entry point starts its own report on
// first render.
export function useStartStepperPerformanceTracking( flow: string, step: string ) {
	useMemo( () => {
		startStepperPerformanceTracking( { fullPageLoad: false } );
		// We need to start tracking again everytime we change flow or step.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flow, step ] );
}

function useStepperPerformanceTrackerStop( flow: string, step: string ) {
	const store = useStore();

	// Use `useLayoutEffect` + rAF to be as close as possible to the actual rendering.
	useLayoutEffect( () => {
		requestAnimationFrame( () => {
			stopPerformanceTracking( 'stepper', {
				/// @ts-expect-error State is not properly typed in the performance tracking lib.
				state: store.getState(),
				metadata: { flow, step },
			} );
		} );
	}, [ store,  flow, step ] );
}

// Stop performance data collection and report.
// This component is placed at the end of the render tree to indicate completion.
export function StepperPerformanceTrackerStop( { flow, step }: { flow: string; step: string } ) {
	useStepperPerformanceTrackerStop( flow, step );

	// Nothing to render, this component is all about side effects
	return null;
}
