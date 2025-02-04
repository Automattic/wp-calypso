import { getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';
import { dispatchReaderTracksEvent } from './analytics.utils';

/**
 * Record a tracks event with additional reader-specific properties.
 * @returns The action object to dispatch.
 */
export const recordReaderTracksEvent =
	( name, properties, { pathnameOverride, post } = {} ) =>
	( dispatch, getState ) => {
		const followsCount = getReaderFollowsCount( getState() );

		dispatchReaderTracksEvent(
			dispatch,
			name,
			{ ...properties, subscription_count: followsCount },
			{ pathnameOverride, post }
		);
	};
