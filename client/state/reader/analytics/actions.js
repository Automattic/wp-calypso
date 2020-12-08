/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getReaderFollowsCount } from 'calypso/state/reader/follows/selectors';

export const recordReaderTracksEvent = ( name, properties ) => ( dispatch, getState ) => {
	const followsCount = getReaderFollowsCount( getState() );
	dispatch(
		recordTracksEvent( name, {
			subscription_count: followsCount,
			...properties,
		} )
	);
};
