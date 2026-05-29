import { useDispatch } from 'react-redux';
import { useFollows } from 'calypso/reader/data/follows';
import {
	ReaderTrackEventOptions,
	ReaderTrackEventProps,
	dispatchReaderTracksEvent,
} from './analytics.utils';

/**
 * A hook version of recordReaderTracksEvent action creator.
 */
export const useRecordReaderTracksEvent = () => {
	const dispatch = useDispatch();
	const { count: followsCount } = useFollows();

	return (
		name: string,
		properties: ReaderTrackEventProps = {},
		{ pathnameOverride, post }: ReaderTrackEventOptions = { post: null }
	): void => {
		return dispatchReaderTracksEvent(
			dispatch,
			name,
			{ ...properties, subscription_count: followsCount },
			{ pathnameOverride, post }
		);
	};
};
