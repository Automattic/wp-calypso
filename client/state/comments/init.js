/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import commentsReducer from './reducer';

registerReducer( [ 'comments' ], commentsReducer );
