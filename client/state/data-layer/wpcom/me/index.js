/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/data-layer/utils';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';

export default mergeHandlers(
	settings,
	sendVerificationEmail,
);
