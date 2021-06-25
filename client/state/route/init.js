/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import routeReducer from './reducer';

registerReducer( [ 'route' ], routeReducer );
