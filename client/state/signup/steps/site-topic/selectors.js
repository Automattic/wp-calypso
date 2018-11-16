/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export const getSignupStepsSiteTopic = state => get( state, 'signup.steps.siteTopic', null );
