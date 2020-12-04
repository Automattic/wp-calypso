/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import readerReducer from './reducer';

registerReducer( [ 'selectedEditor' ], readerReducer );
