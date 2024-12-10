import { buildReaderTracksEventProps } from 'calypso/reader/stats';
import { recordEvent, recordTracksEvent } from 'calypso/state/analytics/actions';

export interface ReaderTrackEventProps {
	[ key: string ]: string | number | undefined;
	subscription_count?: number;
}

export interface ReaderTrackEventOptions {
	pathnameOverride?: string;
	post: object | null;
}

/**
 * A utility function to dispatch a reader specific Tracks event.
 *
 * Note: This function shouldn't be used directly, either use `useRecordReaderTracksEvent` hook or `recordReaderTracksEvent` Redux action.
 */
export function dispatchReaderTracksEvent(
	dispatch: ( action: ReturnType< typeof recordEvent > ) => void,
	eventName: string,
	properties: ReaderTrackEventProps = {},
	{ pathnameOverride, post }: ReaderTrackEventOptions = { post: null }
): void {
	const eventProps = buildReaderTracksEventProps( properties, pathnameOverride, post );
	dispatch( recordTracksEvent( eventName, eventProps ) );
}
