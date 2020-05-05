/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import automatedTransferReducer from './reducer';

registerReducer( [ 'automatedTransfer' ], automatedTransferReducer );
