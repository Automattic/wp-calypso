/**
 * @typedef ReceiptState
 * @type {object}
 * @property {null|import('calypso/state/receipts/assembler').ReceiptData} data
 * @property {null|string} error
 * @property {boolean} hasLoadedFromServer
 * @property {boolean} isRequesting
 */

/**
 * @member {ReceiptState}
 */
export const initialReceiptState = {
	data: null,
	error: null,
	hasLoadedFromServer: false,
	isRequesting: false,
};
