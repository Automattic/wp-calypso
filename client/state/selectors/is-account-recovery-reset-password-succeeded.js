/**
 * External dependencies
 *
 * @format
 */

import { get } from 'lodash';

export default state => get( state, 'accountRecovery.reset.resetPassword.succeeded', false );
