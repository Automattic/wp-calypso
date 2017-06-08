/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import devices from './devices';
import notification from './notification';
import sendVerificationEmail from './send-verification-email';

export default mergeHandlers(
	devices,
	notification,
	sendVerificationEmail,
);
