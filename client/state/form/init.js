/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import formReducer from './reducer';

registerReducer( [ 'form' ], formReducer );
