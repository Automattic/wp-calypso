/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return an object containing the error on requesting to initiate the password reset process.
 *
 * @param {Object} state Global app state
 * @return {?Object} An object containing error info
 */
export default ( state ) => get( state, 'accountRecovery.reset.requestReset.error', null );
