/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import domainsReducer from './reducer';

registerReducer( [ 'domains' ], domainsReducer );
