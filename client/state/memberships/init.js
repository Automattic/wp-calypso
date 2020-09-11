/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import membershipsReducer from './reducer';

registerReducer( [ 'memberships' ], membershipsReducer );
