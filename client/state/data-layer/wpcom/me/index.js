/**
 * Internal dependencies
 */
import devices from './devices';
import notification from './notification';
import sendVerificationEmail from './send-verification-email';
import settings from './settings';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	devices,
	notification,
	settings,
	sendVerificationEmail,
);
