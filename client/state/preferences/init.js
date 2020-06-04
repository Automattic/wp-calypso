/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import preferencesReducer from './reducer';

registerReducer( [ 'preferences' ], preferencesReducer );
