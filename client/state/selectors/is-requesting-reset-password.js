/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'state/account-recovery/init';

export default ( state ) => get( state, 'accountRecovery.reset.resetPassword.isRequesting', false );
