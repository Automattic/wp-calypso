/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';

export default mergeHandlers(
	settings,
	sendVerificationEmail,
);
