/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import jetpackReducer from './reducer';

registerReducer( [ 'jetpack' ], jetpackReducer );
