/*
 * @format
 */

/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import account from './account';
import block from './block';
import connectedApplications from './connected-applications';
import devices from './devices';
import dismiss from './dismiss';
import notification from './notification';
import settings from './settings';
import sendVerificationEmail from './send-verification-email';
import countries from './transactions/supported-countries';
import order from './transactions/order';
import twoStep from './two-step';

export default mergeHandlers(
	account,
	block,
	connectedApplications,
	countries,
	devices,
	dismiss,
	notification,
	settings,
	sendVerificationEmail,
	twoStep,
	order
);
