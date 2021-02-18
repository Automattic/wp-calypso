/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

registerReducer( [ 'followers' ], reducer );
