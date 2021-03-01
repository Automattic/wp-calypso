/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import membershipsReducer from './reducer';

registerReducer( [ 'memberships' ], membershipsReducer );
