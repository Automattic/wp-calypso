import { useViewportMatch } from '@wordpress/compose';
import { useExperiment } from 'calypso/lib/explat';

/**
 * Whether to show the calypso_account_step_entry_clarity_202609 treatment: the switch between
 * signup and login sits below the buttons on both screens.
 *
 * The signup step and the login page share the assignment, so someone who moves between them
 * sees one arrangement. Only 960px and up takes part: below it both screens keep the
 * top-right link.
 */
export default function useEntryClarityExperiment( isEligible: boolean ): boolean {
	// False while the server-rendered login page hydrates, so the first render matches the
	// server's control markup.
	const isLargeViewport = useViewportMatch( 'large' );

	const [ isLoading, assignment ] = useExperiment( 'calypso_account_step_entry_clarity_202609', {
		isEligible: isEligible && isLargeViewport,
	} );

	// Control while loading, so neither screen waits on the assignment. The viewport check
	// repeats here in case the window shrinks after assignment.
	return ! isLoading && isLargeViewport && assignment?.variationName === 'treatment';
}
