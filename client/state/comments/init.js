/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import commentsReducer from './reducer';

registerReducer( [ 'comments' ], commentsReducer );
