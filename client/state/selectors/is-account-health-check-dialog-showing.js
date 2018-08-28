/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export default function isAccountHealthCheckDialogShowing( state ) {
	return get( state, 'ui.accountHealthCheck.isDialogShowing', false );
}
