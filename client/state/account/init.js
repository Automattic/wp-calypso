/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import accountReducer from './reducer';

registerReducer( [ 'account' ], accountReducer );
