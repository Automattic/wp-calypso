/**
 * Lists of statuses in each group, waiting for payment, waiting for
 * fulfillment, and finished orders.
 */
export const statusWaitingPayment = [
	'on-hold',
	'pending',
];
export const statusWaitingFulfillment = [
	'processing',
];
export const statusFinished = [
	'cancelled',
	'completed',
	'failed',
	'refunded',
];

/**
 * Checks if this status (from an order) is in the "waiting for payment" group
 *
 * @param {String} status Order status
 * @return {Boolean} true if the status is awaiting payment
 */
export function isOrderWaitingPayment( status ) {
	return ( -1 !== statusWaitingPayment.indexOf( status ) );
}

/**
 * Checks if this status (from an order) is in the "waiting for fulfillment" group
 *
 * @param {String} status Order status
 * @return {Boolean} true if the status is awaiting fulfillment
 */
export function isOrderWaitingFulfillment( status ) {
	return ( -1 !== statusWaitingFulfillment.indexOf( status ) );
}

/**
 * Checks if this status (from an order) is in the "finished" group
 *
 * @param {String} status Order status
 * @return {Boolean} true if the status is completed, cancelled, or otherwise has no further action
 */
export function isOrderFinished( status ) {
	return ( -1 !== statusFinished.indexOf( status ) );
}
