/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import automatedTransferReducer from './reducer';

registerReducer( [ 'automatedTransfer' ], automatedTransferReducer );
