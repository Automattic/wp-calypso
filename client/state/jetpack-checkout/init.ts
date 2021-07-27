/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import jetpackCheckoutReducer from './reducer';

registerReducer( [ 'jetpackCheckout' ], jetpackCheckoutReducer );
