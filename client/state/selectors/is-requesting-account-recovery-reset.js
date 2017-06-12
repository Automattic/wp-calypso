/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the boolean flag that indicates if the request for initiating the password reset process is in progress.
 *
 * @param {Object} state Global app state.
 * @return {Boolean} Whether the request is in progress.
 */
export default ( state ) => get( state, 'accountRecovery.reset.requestReset.isRequesting', false );
