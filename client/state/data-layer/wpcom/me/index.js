/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import devices from './devices';
import notification from './notification';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';

export default mergeHandlers( devices, notification, settings, sendVerificationEmail );
