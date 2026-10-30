import { useCallback } from 'react';
import {
	OPT_IN_STEPS,
	previewUrl,
	useOptInPreview,
} from 'calypso/dashboard/agency/opt-in-preview/store';

const ARRIVAL = OPT_IN_STEPS.find( ( step ) => step.id === 'arrival' )!;

/**
 * Whether the current user can move the agency to the new dashboard, and the action that
 * does it. This runs on the development-only opt-in preview; with the backend, the agency's
 * `dashboard_opt_in` and its mutation take its place behind the same return value.
 */
export default function useDashboardOptIn() {
	const preview = useOptInPreview();
	const canOptIn = !! preview && preview.role === 'owner' && preview.agency === 'not-opted-in';

	const optIn = useCallback( () => {
		if ( preview ) {
			window.location.href = previewUrl( 'dashboard', ARRIVAL.path, {
				...ARRIVAL.state,
				role: preview.role,
			} );
		}
	}, [ preview ] );

	return { canOptIn, optIn, isPending: false };
}
