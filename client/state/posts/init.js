/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import postsReducer from './reducer';

registerReducer( [ 'posts' ], postsReducer );
