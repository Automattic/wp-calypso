import { useDispatch, useSelector } from 'react-redux';
import { getReaderFollowsCount } from '../follows/selectors';
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
	const followsCount = useSelector( getReaderFollowsCount );

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
