/**
 * Internal dependencies
 */
import { isRequestingSubscribedLists } from 'state/reader/lists/selectors';
import { requestSubscribedLists } from 'state/reader/lists/actions';
import { createQueryComponent } from '../utils';

const QueryReaderLists = createQueryComponent( {
	shouldRequest: ( state ) => ! isRequestingSubscribedLists( state ),
	request: requestSubscribedLists,
} );

export default QueryReaderLists;

