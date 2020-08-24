/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import loginReducer from './reducer';

/**
 * Internal dependencies
 */
import 'state/login/init';

registerReducer( [ 'login' ], loginReducer );
