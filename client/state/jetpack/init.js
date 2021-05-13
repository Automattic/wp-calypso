/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import jetpackReducer from './reducer';

registerReducer( [ 'jetpack' ], jetpackReducer );
