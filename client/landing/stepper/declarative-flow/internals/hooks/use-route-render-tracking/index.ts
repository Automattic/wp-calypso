import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';

export const STEPPER_ROUTE_PATTERN = '/setup/:flow/:step';

interface Params {
	flow: string | null | undefined;
	step: string | null | undefined;
	enabled: boolean;
}

/**
 * Records a `calypso_route_render` event whenever the Stepper resolves a flow step.
 *
 * This is a temporary audit event. Unlike the page view recorded by `useStepRouteTracking`,
 * it fires as soon as the route resolves, without waiting for site data or flow properties.
 */
export const useRouteRenderTracking = ( { flow, step, enabled }: Params ) => {
	useEffect( () => {
		if ( ! enabled || ! flow || ! step ) {
			return;
		}

		recordTracksEvent( 'calypso_route_render', {
			app: 'stepper',
			path: STEPPER_ROUTE_PATTERN,
			pathname: window.location.pathname,
			flow,
			step,
		} );
	}, [ flow, step, enabled ] );
};
