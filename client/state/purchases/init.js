/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import purchasesReducer from './reducer';

registerReducer( [ 'purchases' ], purchasesReducer );
