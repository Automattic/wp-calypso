/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import legalReducer from './reducer';

registerReducer( [ 'legal' ], legalReducer );
