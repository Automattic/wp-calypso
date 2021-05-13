/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import statsReducer from './reducer';

registerReducer( [ 'stats' ], statsReducer );
