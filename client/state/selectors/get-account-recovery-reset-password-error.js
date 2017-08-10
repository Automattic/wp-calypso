/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

export default state => get( state, 'accountRecovery.reset.resetPassword.error', null );
