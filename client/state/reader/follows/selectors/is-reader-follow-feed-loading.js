import 'calypso/state/reader/init';

/*
 * Whether or not the reader follows are loading
 *
 * @param  {object}     state      Global state tree
 * @param  {string}     feedUrl    Feed URL
 * @returns {boolean}              Whether or not the follow request for the given feedUrl is loading
 */
const isReaderFollowFeedLoading = ( state, feedUrl ) =>
	state.reader.follows.followFeedLoading.includes( feedUrl );

export default isReaderFollowFeedLoading;
