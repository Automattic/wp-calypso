/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import loginReducer from './reducer';

/**
 * Internal dependencies
 */
import 'state/login/init';
import 'state/data-layer/wpcom/login-2fa';

registerReducer( [ 'login' ], loginReducer );
