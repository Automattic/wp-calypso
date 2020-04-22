/**
 * Internal dependencies
 */
import { recordTracksEvent as triggerRecordTracksEvent } from './tracks';

export function recordTracksEvent( ...eventArgs: Parameters< typeof triggerRecordTracksEvent > ) {
	return {
		type: 'RECORD_TRACKS_EVENT',
		eventArgs,
	} as const;
}

export const controls = {
	RECORD_TRACKS_EVENT( { eventArgs }: ReturnType< typeof recordTracksEvent > ) {
		triggerRecordTracksEvent( ...eventArgs );
	},
};
