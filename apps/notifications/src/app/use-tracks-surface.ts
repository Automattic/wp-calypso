import { useEffect } from 'react';
import { addTracksSurface } from '../panel/helpers/stats';

/**
 * Where the notifications are shown, as recorded in the `surface` property of their Tracks events.
 */
export type TracksSurface =
	'calypso_panel' | 'calypso_reader_page' | 'dashboard_panel' | 'dashboard_page' | 'wpcom_panel';

/**
 * Adds the surface to the Tracks events recorded while the calling component is mounted.
 */
export function useTracksSurface( surface: TracksSurface | undefined ) {
	useEffect( () => ( surface ? addTracksSurface( surface ) : undefined ), [ surface ] );
}
