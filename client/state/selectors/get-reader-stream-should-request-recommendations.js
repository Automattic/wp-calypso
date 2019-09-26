/**
 * Internal dependencies
 */
import { getDistanceBetweenRecs, RECS_PER_BLOCK } from 'reader/stream/utils';
import getReaderFollows from 'state/selectors/get-reader-follows';
import getReaderStream from 'state/selectors/get-reader-stream';

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
	const recsStream = getReaderStream( state, recsStreamKey );
	const recs = recsStream.items;

	if ( recsStream.lastPage || recsStream.isRequesting ) {
		return false;
	}

	if ( recs.length === 0 ) {
		return true;
	}

	return recs.length < items.length * ( RECS_PER_BLOCK / getDistanceBetweenRecs( totalSubs ) );
}

export default shouldRequestRecs;
