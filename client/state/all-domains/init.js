/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import allDomainsReducer from './reducer';

export const allDomains = 'allDomains';

registerReducer( [ allDomains ], allDomainsReducer );
