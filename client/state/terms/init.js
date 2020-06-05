/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import termsReducer from './reducer';

registerReducer( [ 'terms' ], termsReducer );
