/**
 * Internal dependencies
 */

import { WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';

/**
 * Creates an action list to save payment settings
 *
 * Saves the payment settings (currency and methods).
 *
 * @param {object} [successAction] Action to be dispatched upon successful completion.
 * @param {object} [failureAction] Action to be dispatched upon failure of execution.
 * @returns {object} Action object.
 */
export const createPaymentSettingsActionList = ( successAction, failureAction ) => {
	return {
		type: WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE,
		successAction,
		failureAction,
	};
};
