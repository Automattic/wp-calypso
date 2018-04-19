/** @format */

/**
 * Internal dependencies
 */
import { getDistanceBetweenRecs, RECS_PER_BLOCK } from 'reader/stream/utils';
import { getReaderFollows, getReaderStream } from 'state/selectors';

/*
 * shouldRequestRecs is used for calculating whether or not we need more recommendations
 * to display in-stream recs for a stream.
 */
function shouldRequestRecs( state, streamKey, recsStreamKey ) {
	if ( ! recsStreamKey ) {
		return false;
	}

	const totalSubs = getReaderFollows( state ).length;
	const items = getReaderStream( state, streamKey ).items;
	const recs = getReaderStream( state, recsStreamKey ).items;

	if ( recs.length === 0 ) {
		return true;
	}

	return recs.length < items.length * ( RECS_PER_BLOCK / getDistanceBetweenRecs( totalSubs ) );
}

export default shouldRequestRecs;
