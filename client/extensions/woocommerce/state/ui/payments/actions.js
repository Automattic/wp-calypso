/**
 * Internal dependencies
 */
import { WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';

/**
 * Creates an action list to save payment settings
 *
 * Saves the payment settings (currency and methods).
 * @param {Object} [successAction] Action to be dispatched upon successful completion.
 * @param {Object} [failureAction] Action to be dispatched upon failure of execution.
 * @return {Object} Action object.
 */
export const createPaymentSettingsActionList = ( successAction, failureAction ) => {
	return {
		type: WOOCOMMERCE_PAYMENT_ACTION_LIST_CREATE,
		successAction,
		failureAction,
	};
};
