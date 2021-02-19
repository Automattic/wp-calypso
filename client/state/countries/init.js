/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import countriesReducer from './reducer';

registerReducer( [ 'countries' ], countriesReducer );
