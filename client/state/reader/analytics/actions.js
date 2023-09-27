import { buildReaderTracksEventProps } from 'calypso/reader/stats';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';

export const recordReaderTracksEvent =
	( name, properties, { pathnameOverride, post } = {} ) =>
	( dispatch, getState ) => {
		const eventProps = buildReaderTracksEventProps( properties, pathnameOverride, post );
		const followsCount = getReaderFollowsCount( getState() );
		dispatch(
			recordTracksEvent( name, {
				subscription_count: followsCount,
				...eventProps,
			} )
		);
	};
