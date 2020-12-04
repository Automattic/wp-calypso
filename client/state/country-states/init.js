/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import countryStatesReducer from './reducer';

registerReducer( [ 'countryStates' ], countryStatesReducer );
