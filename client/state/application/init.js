/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import applicationReducer from './reducer';

registerReducer( [ 'application' ], applicationReducer );
