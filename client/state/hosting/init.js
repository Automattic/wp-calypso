/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import hostingReducer from './reducer';

registerReducer( [ 'atomicHosting' ], hostingReducer );
