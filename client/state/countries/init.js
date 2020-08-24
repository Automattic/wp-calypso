/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import countriesReducer from './reducer';

registerReducer( [ 'countries' ], countriesReducer );
