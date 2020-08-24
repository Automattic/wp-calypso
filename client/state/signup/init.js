/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import signupReducer from './reducer';

registerReducer( [ 'signup' ], signupReducer );
