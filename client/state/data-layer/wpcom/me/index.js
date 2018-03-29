/*
 * @format
 */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import block from './block';
import devices from './devices';
import notification from './notification';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';
import countries from './transactions/supported-countries';
import twoStep from './two-step';
import sourcePayment from './transactions/source-payment';

export default mergeHandlers(
	block,
	countries,
	devices,
	notification,
	settings,
	sendVerificationEmail,
	twoStep,
	sourcePayment
);
