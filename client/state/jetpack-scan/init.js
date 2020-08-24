/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import jetpackScanReducer from './reducer';

registerReducer( [ 'jetpackScan' ], jetpackScanReducer );
