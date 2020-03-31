/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import presenceReducer from './reducer';

registerReducer( [ 'presence' ], presenceReducer );
