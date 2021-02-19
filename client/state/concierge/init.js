/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import conciergeReducer from './reducer';

registerReducer( [ 'concierge' ], conciergeReducer );
