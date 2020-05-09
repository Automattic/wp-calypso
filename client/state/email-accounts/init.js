/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import emailAccountsReducer from './reducer';

registerReducer( [ 'emailAccounts2' ], emailAccountsReducer );
