/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import jetpackConnectReducer from './reducer';

registerReducer( [ 'jetpackConnect' ], jetpackConnectReducer );
