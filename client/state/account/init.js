/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import accountReducer from './reducer';

registerReducer( [ 'account' ], accountReducer );
