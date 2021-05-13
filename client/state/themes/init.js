/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import themesReducer from './reducer';

registerReducer( [ 'themes' ], themesReducer );
