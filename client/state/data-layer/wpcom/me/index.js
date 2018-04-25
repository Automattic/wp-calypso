/*
 * @format
 */

/**
 * Internal dependencies
 */

import { mergeHandlers } from 'state/action-watchers/utils';
import block from './block';
import connectedAccounts from './connected-accounts';
import devices from './devices';
import notification from './notification';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';
import countries from './transactions/supported-countries';
import order from './transactions/order';
import twoStep from './two-step';

export default mergeHandlers(
	block,
	connectedAccounts,
	countries,
	devices,
	notification,
	settings,
	sendVerificationEmail,
	twoStep,
	order
);
