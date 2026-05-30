import {
	getFollowsCountFromData,
	getFollowsQueryKey,
	type FollowsInfiniteData,
} from '@automattic/api-queries';
import { useDispatch } from 'react-redux';
import { getCalypsoQueryClient } from 'calypso/state/query-client';
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

	return (
		name: string,
		properties: ReaderTrackEventProps = {},
		{ pathnameOverride, post }: ReaderTrackEventOptions = { post: null }
	): void => {
		const queryClient = getCalypsoQueryClient();
		const followsCount = queryClient
			? getFollowsCountFromData(
					queryClient.getQueryData< FollowsInfiniteData >( getFollowsQueryKey() )
			  )
			: 0;

		return dispatchReaderTracksEvent(
			dispatch,
			name,
			{ ...properties, subscription_count: followsCount },
			{ pathnameOverride, post }
		);
	};
};
