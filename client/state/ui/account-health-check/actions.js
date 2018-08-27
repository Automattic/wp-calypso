/** @format */

/**
 * Internal dependencies
 */
import {
	ACCOUNT_HEALTH_CHECK_DIALOG_HIDE,
	ACCOUNT_HEALTH_CHECK_DIALOG_SHOW,
} from 'state/action-types';

export const hideAccountCheckDialog = () => ( { type: ACCOUNT_HEALTH_CHECK_DIALOG_HIDE } );
export const showAccountCheckDialog = () => ( { type: ACCOUNT_HEALTH_CHECK_DIALOG_SHOW } );
