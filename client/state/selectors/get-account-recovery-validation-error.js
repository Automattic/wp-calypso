/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns an object containing error information on validating an account recovery key.
 *
 * @param  {Object}  state Global state tree.
 * @return {?Object}       The validation is in progress or not.
 */
export default ( state ) => get( state, 'accountRecovery.reset.validate.error', null );
