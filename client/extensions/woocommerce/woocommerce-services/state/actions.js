/**
 * Internal dependencies
 */
import { WOOCOMMERCE_SERVICES_SHIPPING_ACTION_LIST_CREATE } from 'woocommerce/state/action-types';

/**
 * Creates an action list to save WCS shipping settings (labels and packages)
 *
 * Saves the WCS settings
 * @param {Function} [successAction] Action to be dispatched upon successful completion.
 * @param {Function} [failureAction] Action to be dispatched upon failure of execution.
 * @return {Object} Action object.
 */
export function createWcsShippingSaveActionList(
	successAction,
	failureAction,
) {
	return {
		type: WOOCOMMERCE_SERVICES_SHIPPING_ACTION_LIST_CREATE,
		successAction,
		failureAction,
	};
}
