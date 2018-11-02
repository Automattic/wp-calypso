/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'signup.steps.siteTopic', null );
