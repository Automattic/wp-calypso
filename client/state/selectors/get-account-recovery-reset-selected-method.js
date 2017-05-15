/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return a string of the currently picked password resetting method
 *
 * @param  {Object} state Global app state.
 * @return {?String}      The string representation of the currently picked password reset method.
 */
export default ( state ) => get( state, 'accountRecovery.reset.method', null );
