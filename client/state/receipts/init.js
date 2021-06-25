/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import receiptsReducer from './reducer';

registerReducer( [ 'receipts' ], receiptsReducer );
