/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import countryStatesReducer from './reducer';

registerReducer( [ 'countryStates' ], countryStatesReducer );
