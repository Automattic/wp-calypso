/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import readerReducer from './reducer';

registerReducer( [ 'reader' ], readerReducer );
