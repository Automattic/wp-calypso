/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import applicationReducer from './reducer';

registerReducer( [ 'application' ], applicationReducer );
