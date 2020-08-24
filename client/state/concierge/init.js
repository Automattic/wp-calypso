/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import conciergeReducer from './reducer';

registerReducer( [ 'concierge' ], conciergeReducer );
