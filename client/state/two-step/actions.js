/** @format */

/**
 * Internal dependencies
 */

import { TWO_STEP_REQUEST, TWO_STEP_SET } from 'state/action-types';

/**
 * Returns an action object to signal the request of the user's two step configuration.
 * @returns {Object} Action object
 */
export const requestTwoStep = () => ( { type: TWO_STEP_REQUEST } );

export const setTwoStep = data => ( { type: TWO_STEP_SET, data } );
