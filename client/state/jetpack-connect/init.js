/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import jetpackConnectReducer from './reducer';

registerReducer( [ 'jetpackConnect' ], jetpackConnectReducer );
