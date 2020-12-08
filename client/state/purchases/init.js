/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import purchasesReducer from './reducer';

registerReducer( [ 'purchases' ], purchasesReducer );
