/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import postsReducer from './reducer';

registerReducer( [ 'posts' ], postsReducer );
