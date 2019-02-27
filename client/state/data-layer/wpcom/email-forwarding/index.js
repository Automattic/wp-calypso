/** @format */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import add from './add';
import get from './get';
import remove from './remove';
import resendEmailVerification from './resend-email-verification';

import { registerHandlers } from 'state/data-layer/handler-registry';

registerHandlers(
	'state/data-layer/wpcom/email-forwarding/index.js',
	mergeHandlers( get, add, remove, resendEmailVerification )
);
