/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import hostingReducer from './reducer';

registerReducer( [ 'atomicHosting' ], hostingReducer );
