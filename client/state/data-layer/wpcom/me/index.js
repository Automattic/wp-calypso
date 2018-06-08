/** @format */

/**
 * Internal dependencies
 */
import account from './account';
import block from './block';
import connectedApplications from './connected-applications';
import countries from './transactions/supported-countries';
import devices from './devices';
import notification from './notification';
import order from './transactions/order';
import purchases from './purchases';
import sendVerificationEmail from './send-verification-email';
import settings from './settings';
import twoStep from './two-step';
import { mergeHandlers } from 'state/action-watchers/utils';

export default mergeHandlers(
	account,
	block,
	connectedApplications,
	countries,
	devices,
	notification,
	order,
	purchases,
	sendVerificationEmail,
	settings,
	twoStep
);
