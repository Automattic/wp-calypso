/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import jetpackScanReducer from './reducer';

registerReducer( [ 'jetpackScan' ], jetpackScanReducer );
