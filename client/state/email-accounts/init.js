/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import emailAccountsReducer from './reducer';

registerReducer( [ 'emailAccounts' ], emailAccountsReducer );
