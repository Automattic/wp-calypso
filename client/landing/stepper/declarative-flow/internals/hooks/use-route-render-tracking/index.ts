import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

interface Params {
	flow: string | null | undefined;
	step: string | null | undefined;
	enabled: boolean;
}

/**
 * Records a `calypso_route_render` event whenever the Stepper resolves a flow step.
 *
 * Temporary audit event: remove after the comparison with `calypso_page_view`. The `path`
 * uses the same `/setup/<flow>/<step>` form as that page view so the two compare directly.
 */
export const useRouteRenderTracking = ( { flow, step, enabled }: Params ) => {
	useEffect( () => {
		if ( ! enabled || ! flow || ! step ) {
			return;
		}

		recordTracksEvent( 'calypso_route_render', {
			app: 'stepper',
			path: `/setup/${ flow }/${ step }`,
			flow,
			step,
		} );
	}, [ flow, step, enabled ] );
};
