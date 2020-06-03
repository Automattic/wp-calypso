/**
 * Internal dependencies
 */
import { registerReducer } from 'state/redux-store';
import allDomains from './reducer';

registerReducer( [ 'allDomains' ], allDomains );
