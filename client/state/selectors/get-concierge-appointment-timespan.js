/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'concierge.appointmentTimespan', null );
