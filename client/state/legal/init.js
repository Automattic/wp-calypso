/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import legalReducer from './reducer';

registerReducer( [ 'legal' ], legalReducer );
