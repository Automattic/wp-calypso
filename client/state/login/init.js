/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import loginReducer from './reducer';

/**
 * Internal dependencies
 */
import 'calypso/state/login/init';

registerReducer( [ 'login' ], loginReducer );
