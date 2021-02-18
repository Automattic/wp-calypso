/**
 * Internal dependencies
 */
import { registerReducer } from 'calypso/state/redux-store';
import allDomainsReducer from './reducer';

export const allDomains = 'allDomains';

registerReducer( [ allDomains ], allDomainsReducer );
