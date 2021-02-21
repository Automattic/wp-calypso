/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import preferencesReducer from './reducer';

registerReducer( [ 'preferences' ], preferencesReducer );
