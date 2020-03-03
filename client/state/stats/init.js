/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import statsReducer from './reducer';

registerReducer( [ 'stats' ], statsReducer );
