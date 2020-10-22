/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import formReducer from './reducer';

registerReducer( [ 'form' ], formReducer );
