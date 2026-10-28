import { useViewportMatch } from '@wordpress/compose';
import { useEffect, useState } from 'react';
import { dangerouslyGetExperimentAssignment, useExperiment } from 'calypso/lib/explat';

const EXPERIMENT_NAME = 'calypso_account_step_entry_clarity_202609';

/**
 * Whether to show the calypso_account_step_entry_clarity_202609 treatment: the switch between
 * signup and login sits below the buttons on both screens.
 *
 * The signup step assigns; the login page follows that assignment through
 * useEntryClarityLoginTreatment, so someone who moves between them sees one arrangement. Only
 * 960px and up takes part: below it both screens keep the top-right link.
 */
export default function useEntryClarityExperiment( isEligible: boolean ): boolean {
	// False while the server-rendered login page hydrates, so the first render matches the
	// server's control markup.
	const isLargeViewport = useViewportMatch( 'large' );

	const [ isLoading, assignment ] = useExperiment( EXPERIMENT_NAME, {
		isEligible: isEligible && isLargeViewport,
	} );

	// Control while loading, so neither screen waits on the assignment. The viewport check
	// repeats here in case the window shrinks after assignment.
	return ! isLoading && isLargeViewport && assignment?.variationName === 'treatment';
}

/**
 * The login page's side of the experiment: it shows the treatment only to visitors the signup
 * step already assigned, and never requests an assignment itself.
 */
export function useEntryClarityLoginTreatment( isEligible: boolean ): boolean {
	const isLargeViewport = useViewportMatch( 'large' );
	const [ isTreatment, setIsTreatment ] = useState( false );

	// After hydration, so the first render matches the server's control markup. With nothing
	// stored, this returns a fallback assignment with no variation.
	useEffect( () => {
		setIsTreatment(
			isEligible &&
				dangerouslyGetExperimentAssignment( EXPERIMENT_NAME ).variationName === 'treatment'
		);
	}, [ isEligible ] );

	return isLargeViewport && isTreatment;
}
