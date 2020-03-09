/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import sitesReducer from './reducer';

registerReducer( [ 'sites' ], sitesReducer );
