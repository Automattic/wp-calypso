/**
 * Internal dependencies
 */
import { shouldFeedBeFetched } from 'state/reader/feeds/selectors';
import { requestFeed } from 'state/reader/feeds/actions';
import { createQueryComponent } from '../utils';

const QueryReaderFeed = createQueryComponent( {
	shouldRequest: shouldFeedBeFetched,
	shouldRequestArg: 'feedId',
	request: requestFeed,
	requestArg: 'feedId',
} );

export default QueryReaderFeed;
