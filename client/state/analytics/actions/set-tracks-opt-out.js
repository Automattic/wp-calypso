/**
 * Internal dependencies
 */
import { ANALYTICS_TRACKS_OPT_OUT } from 'calypso/state/action-types';

export function setTracksOptOut( isOptingOut ) {
	return {
		type: ANALYTICS_TRACKS_OPT_OUT,
		isOptingOut,
	};
}
