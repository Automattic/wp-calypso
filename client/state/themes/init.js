/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import themesReducer from './reducer';

registerReducer( [ 'themes' ], themesReducer );
