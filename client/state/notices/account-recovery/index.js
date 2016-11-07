/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchError } from '../utils';

import {
	ACCOUNT_RECOVERY_FETCH_FAILED,
	ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,
	ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,
	ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED,
	ACCOUNT_RECOVERY_EMAIL_DELETE_FAILED,
} from 'state/action-types';

const handlers = {
	[ ACCOUNT_RECOVERY_FETCH_FAILED ]: dispatchError(
		translate( 'An error occurred while fetching for your account recovery settings.' )
	),
	[ ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED ]: dispatchError(
		translate( 'An error occurred while updating your account recovery phone number.' )
	),
	[ ACCOUNT_RECOVERY_PHONE_DELETE_FAILED ]: dispatchError(
		translate( 'An error occurred while deleting your account recovery phone number.' )
	),
	[ ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED ]: dispatchError(
		translate( 'An error occurred while updating your account recovery email.' )
	),
	[ ACCOUNT_RECOVERY_EMAIL_DELETE_FAILED ]: dispatchError(
		translate( 'An error occurred while deleting your account recovery email.' )
	),
};

export default handlers;
