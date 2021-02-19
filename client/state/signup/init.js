/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import signupReducer from './reducer';

registerReducer( [ 'signup' ], signupReducer );
