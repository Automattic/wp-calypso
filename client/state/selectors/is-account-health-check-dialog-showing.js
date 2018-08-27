/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

export function isAccountHealthCheckDialogShowing( state ) {
	return get( state, 'ui.accountHealthCheck.isDialogShowing', false );
}
