import 'calypso/state/reader/init';

/*
 * Whether or not the reader follows are loading
 *
 * @param  {object}  state  Global state tree
 * @returns {boolean} Follow count
 */
const isReaderFollowsLoading = ( state ) => state.reader.follows.loading;

export default isReaderFollowsLoading;
