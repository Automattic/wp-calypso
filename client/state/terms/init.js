/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import termsReducer from './reducer';

registerReducer( [ 'terms' ], termsReducer );
