/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import domainsReducer from './reducer';

registerReducer( [ 'domains' ], domainsReducer );
